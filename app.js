// Layout do apartamento: móveis em escala sobre a planta.
// Posições e medidas dos móveis são guardadas em metros; a escala (px/m) converte para a imagem.
(function () {
  'use strict';

  const CHAVE = 'layout-apto-v1';
  const CHAVE_TEMA = 'layout-apto-tema';
  const PLANTAS = { escuro: 'planta_escura.png', claro: 'planta_paredes_janelas_cotas.png' };
  const $ = (id) => document.getElementById(id);

  const viewport = $('viewport');
  const palco = $('palco');
  const planta = $('planta');
  const camadaItens = $('camadaItens');
  const camadaMedida = $('camadaMedida');
  const dica = $('dica');

  let estado = carregar() || {
    escala: window.ESCALA_PADRAO,
    catalogo: window.CATALOGO_PADRAO.map((c) => ({ ...c })),
    itens: [],
  };
  let selecionadoId = null;
  let vista = { zoom: 1, x: 0, y: 0 };
  let ferramenta = null; // 'calibrar' | 'medir' | null
  let pontos = [];

  // ---------- persistência ----------

  function carregar() {
    try {
      const txt = localStorage.getItem(CHAVE);
      return txt ? JSON.parse(txt) : null;
    } catch (e) {
      return null;
    }
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      // sem armazenamento (ex.: modo privado): segue funcionando sem salvar
    }
  }

  const novoId = () => Math.random().toString(36).slice(2, 10);

  // ---------- tema ----------

  function aplicarTema(tema) {
    document.documentElement.dataset.tema = tema;
    planta.src = PLANTAS[tema];
    $('btnTema').textContent = tema === 'escuro' ? 'Tema claro' : 'Tema escuro';
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch (e) {
      // sem armazenamento: o tema vale só nesta visita
    }
  }

  function temaSalvo() {
    try {
      return localStorage.getItem(CHAVE_TEMA) === 'claro' ? 'claro' : 'escuro';
    } catch (e) {
      return 'escuro';
    }
  }

  // ---------- vista (zoom e deslocamento) ----------

  function aplicarVista() {
    palco.style.transform = `translate(${vista.x}px, ${vista.y}px) scale(${vista.zoom})`;
  }

  function ajustarVista() {
    const r = viewport.getBoundingClientRect();
    const w = planta.naturalWidth || 1600;
    const h = planta.naturalHeight || 1430;
    vista.zoom = Math.min((r.width - 40) / w, (r.height - 40) / h);
    vista.x = (r.width - w * vista.zoom) / 2;
    vista.y = (r.height - h * vista.zoom) / 2;
    aplicarVista();
  }

  function zoomEm(fator, cx, cy) {
    const novo = Math.min(8, Math.max(0.1, vista.zoom * fator));
    const f = novo / vista.zoom;
    vista.x = cx - (cx - vista.x) * f;
    vista.y = cy - (cy - vista.y) * f;
    vista.zoom = novo;
    aplicarVista();
  }

  // coordenadas do evento em pixels da imagem
  function noPalco(ev) {
    const r = viewport.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left - vista.x) / vista.zoom,
      y: (ev.clientY - r.top - vista.y) / vista.zoom,
    };
  }

  // ---------- desenho ----------

  function desenharCatalogo() {
    const ul = $('catalogo');
    ul.innerHTML = '';
    estado.catalogo.forEach((c, i) => {
      const li = document.createElement('li');
      li.innerHTML =
        `<span class="amostra" style="background:${c.cor}"></span>` +
        `<span class="nome"></span>` +
        `<span class="medida">${c.larg}×${c.prof}</span>` +
        `<button title="Colocar na planta">+</button>` +
        `<button class="remover" title="Remover do catálogo">✕</button>`;
      li.querySelector('.nome').textContent = c.nome;
      li.querySelector('button').onclick = () => colocar(c);
      li.querySelector('.remover').onclick = () => {
        if (!confirm(`Remover "${c.nome}" do catálogo? (móveis já na planta continuam)`)) return;
        estado.catalogo.splice(i, 1);
        salvar();
        desenharCatalogo();
      };
      ul.appendChild(li);
    });
  }

  function desenharItens() {
    const s = estado.escala;
    camadaItens.innerHTML = '';
    estado.itens.forEach((it) => {
      const el = document.createElement('div');
      el.className = 'movel' + (it.id === selecionadoId ? ' selecionado' : '');
      el.dataset.id = it.id;
      el.style.width = (it.larg / 100) * s + 'px';
      el.style.height = (it.prof / 100) * s + 'px';
      el.style.left = it.x * s + 'px';
      el.style.top = it.y * s + 'px';
      el.style.transform = `translate(-50%, -50%) rotate(${it.rot}deg)`;
      el.style.background = it.cor + 'b3'; // ~70% de opacidade para ver a planta por baixo
      const rot = document.createElement('div');
      rot.className = 'rotulo';
      rot.textContent = it.nome;
      const med = document.createElement('small');
      med.textContent = `${it.larg}×${it.prof} cm`;
      rot.appendChild(med);
      el.appendChild(rot);
      camadaItens.appendChild(el);
    });
    desenharPainel();
  }

  function desenharPainel() {
    const it = selecionado();
    $('painelSel').hidden = !it;
    if (!it) return;
    const f = $('formSel');
    // não sobrescreve o campo que o usuário está editando
    ['nome', 'larg', 'prof', 'rot', 'cor'].forEach((k) => {
      if (document.activeElement !== f.elements[k]) f.elements[k].value = it[k];
    });
  }

  function desenharEscala() {
    $('infoEscala').textContent = `Escala: ${estado.escala.toFixed(1)} px/m`;
  }

  function desenharMedida(cursor) {
    const pts = cursor ? pontos.concat([cursor]) : pontos;
    let svg = '';
    if (pts.length >= 1) {
      pts.forEach((p) => {
        svg += `<circle cx="${p.x}" cy="${p.y}" r="${5 / vista.zoom}" fill="#d33"/>`;
      });
    }
    if (pts.length === 2) {
      const [a, b] = pts;
      const dpx = Math.hypot(b.x - a.x, b.y - a.y);
      const lw = 2 / vista.zoom;
      svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#d33" stroke-width="${lw}"/>`;
      if (ferramenta === 'medir') {
        const fs = 16 / vista.zoom;
        svg +=
          `<text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - fs / 2}" font-size="${fs}" ` +
          `fill="#d33" stroke="#fff" stroke-width="${fs / 5}" paint-order="stroke" text-anchor="middle">` +
          `${(dpx / estado.escala).toFixed(2)} m</text>`;
      }
    }
    camadaMedida.innerHTML = svg;
  }

  function mostrarDica(txt) {
    dica.textContent = txt || '';
    dica.hidden = !txt;
  }

  // ---------- móveis ----------

  const selecionado = () => estado.itens.find((i) => i.id === selecionadoId) || null;

  function selecionar(id) {
    selecionadoId = id;
    camadaItens.querySelectorAll('.movel').forEach((el) => {
      el.classList.toggle('selecionado', el.dataset.id === id);
    });
    desenharPainel();
  }

  function colocar(c) {
    // aparece no centro da área visível
    const r = viewport.getBoundingClientRect();
    const cx = (r.width / 2 - vista.x) / vista.zoom;
    const cy = (r.height / 2 - vista.y) / vista.zoom;
    const it = {
      id: novoId(),
      nome: c.nome,
      larg: c.larg,
      prof: c.prof,
      cor: c.cor,
      rot: 0,
      x: cx / estado.escala,
      y: cy / estado.escala,
    };
    estado.itens.push(it);
    selecionadoId = it.id;
    salvar();
    desenharItens();
  }

  function acao(nome) {
    const it = selecionado();
    if (!it) return;
    if (nome === 'girar90') it.rot = (it.rot + 90) % 360;
    else if (nome === 'girar15') it.rot = (it.rot + 15) % 360;
    else if (nome === 'duplicar') {
      const copia = { ...it, id: novoId(), x: it.x + 0.2, y: it.y + 0.2 };
      estado.itens.push(copia);
      selecionadoId = copia.id;
    } else if (nome === 'excluir') {
      estado.itens = estado.itens.filter((i) => i !== it);
      selecionadoId = null;
    }
    salvar();
    desenharItens();
  }

  // ---------- ferramentas (calibrar / medir) ----------

  function definirFerramenta(f) {
    ferramenta = ferramenta === f ? null : f;
    pontos = [];
    $('btnCalibrar').classList.toggle('ativo', ferramenta === 'calibrar');
    $('btnMedir').classList.toggle('ativo', ferramenta === 'medir');
    viewport.classList.toggle('ferramenta', !!ferramenta);
    mostrarDica(
      ferramenta === 'calibrar' ? 'Calibrar: clique no início e no fim de uma cota conhecida (Esc cancela)'
      : ferramenta === 'medir' ? 'Medir: clique em dois pontos (Esc encerra)'
      : ''
    );
    desenharMedida();
  }

  function cliqueFerramenta(p) {
    if (pontos.length === 2) pontos = [];
    pontos.push(p);
    desenharMedida();
    if (pontos.length < 2 || ferramenta !== 'calibrar') return;

    const dpx = Math.hypot(pontos[1].x - pontos[0].x, pontos[1].y - pontos[0].y);
    const resp = prompt('Distância real entre os dois pontos, em metros (ex.: 3.20):');
    const m = resp && parseFloat(resp.replace(',', '.'));
    if (m > 0 && dpx > 0) {
      estado.escala = dpx / m;
      salvar();
      desenharEscala();
      desenharItens();
    }
    definirFerramenta(null);
  }

  // ---------- interação com o mouse ----------

  let arrasto = null;

  viewport.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    if (ferramenta) {
      cliqueFerramenta(noPalco(ev));
      return;
    }
    const el = ev.target.closest('.movel');
    viewport.setPointerCapture(ev.pointerId);
    if (el) {
      const it = estado.itens.find((i) => i.id === el.dataset.id);
      selecionar(it.id);
      const p = noPalco(ev);
      arrasto = { tipo: 'movel', it, el, dx: p.x / estado.escala - it.x, dy: p.y / estado.escala - it.y };
    } else {
      selecionar(null);
      arrasto = { tipo: 'vista', x0: ev.clientX - vista.x, y0: ev.clientY - vista.y };
      viewport.classList.add('arrastando');
    }
  });

  viewport.addEventListener('pointermove', (ev) => {
    if (ferramenta === 'medir' && pontos.length === 1) desenharMedida(noPalco(ev));
    if (!arrasto) return;
    if (arrasto.tipo === 'vista') {
      vista.x = ev.clientX - arrasto.x0;
      vista.y = ev.clientY - arrasto.y0;
      aplicarVista();
    } else {
      const p = noPalco(ev);
      const it = arrasto.it;
      it.x = p.x / estado.escala - arrasto.dx;
      it.y = p.y / estado.escala - arrasto.dy;
      arrasto.el.style.left = it.x * estado.escala + 'px';
      arrasto.el.style.top = it.y * estado.escala + 'px';
    }
  });

  const fimArrasto = () => {
    if (arrasto && arrasto.tipo === 'movel') salvar();
    arrasto = null;
    viewport.classList.remove('arrastando');
  };
  viewport.addEventListener('pointerup', fimArrasto);
  viewport.addEventListener('pointercancel', fimArrasto);

  viewport.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const r = viewport.getBoundingClientRect();
    zoomEm(ev.deltaY < 0 ? 1.15 : 1 / 1.15, ev.clientX - r.left, ev.clientY - r.top);
    if (ferramenta) desenharMedida();
  }, { passive: false });

  // ---------- teclado ----------

  document.addEventListener('keydown', (ev) => {
    if (ev.target.matches('input, textarea')) return;
    if (ev.key === 'Escape') {
      if (ferramenta) definirFerramenta(null);
      else selecionar(null);
      return;
    }
    const it = selecionado();
    if (!it) return;
    const passo = (ev.shiftKey ? 10 : 1) / 100;
    const setas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (setas[ev.key]) {
      it.x += setas[ev.key][0] * passo;
      it.y += setas[ev.key][1] * passo;
      salvar();
      desenharItens();
      ev.preventDefault();
    } else if (ev.key === 'r' || ev.key === 'R') {
      acao(ev.shiftKey ? 'girar15' : 'girar90');
    } else if (ev.key === 'd' || ev.key === 'D') {
      acao('duplicar');
    } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
      acao('excluir');
      ev.preventDefault();
    }
  });

  // ---------- formulários e botões ----------

  $('formNovo').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = ev.target.elements;
    estado.catalogo.push({
      nome: f.nome.value.trim(),
      larg: Math.round(+f.larg.value),
      prof: Math.round(+f.prof.value),
      cor: f.cor.value,
    });
    salvar();
    desenharCatalogo();
    ev.target.reset();
  });

  $('formSel').addEventListener('input', (ev) => {
    const it = selecionado();
    if (!it) return;
    const campo = ev.target.name;
    let v = ev.target.value;
    if (campo === 'larg' || campo === 'prof') {
      v = Math.round(+v);
      if (!(v > 0)) return;
    } else if (campo === 'rot') {
      v = ((+v % 360) + 360) % 360;
      if (isNaN(v)) return;
    }
    it[campo] = v;
    salvar();
    desenharItens();
  });

  document.querySelectorAll('[data-acao]').forEach((b) => {
    b.addEventListener('click', () => acao(b.dataset.acao));
  });

  $('btnTema').onclick = () => aplicarTema(document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro');
  $('btnCalibrar').onclick = () => definirFerramenta('calibrar');
  $('btnMedir').onclick = () => definirFerramenta('medir');
  $('btnAjustar').onclick = ajustarVista;
  $('btnZoomMais').onclick = () => {
    const r = viewport.getBoundingClientRect();
    zoomEm(1.25, r.width / 2, r.height / 2);
  };
  $('btnZoomMenos').onclick = () => {
    const r = viewport.getBoundingClientRect();
    zoomEm(1 / 1.25, r.width / 2, r.height / 2);
  };

  $('btnLimpar').onclick = () => {
    if (!estado.itens.length || !confirm('Remover todos os móveis da planta?')) return;
    estado.itens = [];
    selecionadoId = null;
    salvar();
    desenharItens();
  };

  function baixar(nome, blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  $('btnExportar').onclick = () => {
    baixar('layout-apartamento.json', new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' }));
  };

  $('btnImportar').onclick = () => $('arqImportar').click();
  $('arqImportar').onchange = async (ev) => {
    const arq = ev.target.files[0];
    ev.target.value = '';
    if (!arq) return;
    try {
      const dados = JSON.parse(await arq.text());
      if (!Array.isArray(dados.itens) || !(dados.escala > 0)) throw new Error('formato inválido');
      estado = { escala: dados.escala, catalogo: dados.catalogo || [], itens: dados.itens };
      selecionadoId = null;
      salvar();
      desenharTudo();
    } catch (e) {
      alert('Não foi possível importar: ' + e.message);
    }
  };

  // PNG do layout no tamanho da planta
  $('btnPng').onclick = () => {
    const s = estado.escala;
    const cv = document.createElement('canvas');
    cv.width = planta.naturalWidth;
    cv.height = planta.naturalHeight;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--planta-fundo').trim();
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(planta, 0, 0);
    estado.itens.forEach((it) => {
      const w = (it.larg / 100) * s;
      const h = (it.prof / 100) * s;
      ctx.save();
      ctx.translate(it.x * s, it.y * s);
      ctx.rotate((it.rot * Math.PI) / 180);
      ctx.fillStyle = it.cor + 'b3';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,0,0,.55)';
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,.8)';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      [[it.nome, '22px', -11], [`${it.larg}×${it.prof} cm`, '18px', 13]].forEach(([txt, tam, y]) => {
        ctx.font = `${tam} system-ui, sans-serif`;
        ctx.strokeText(txt, 0, y);
        ctx.fillText(txt, 0, y);
      });
      ctx.restore();
    });
    try {
      cv.toBlob((b) => baixar('layout-apartamento.png', b));
    } catch (e) {
      // abrindo por file://, alguns navegadores bloqueiam exportar a imagem da planta
      alert('O navegador bloqueou salvar a imagem com a página aberta direto do arquivo.\n' +
        'Abra por um servidor local (veja o README.md) ou use a captura de tela.');
    }
  };

  // ---------- início ----------

  function desenharTudo() {
    desenharCatalogo();
    desenharItens();
    desenharEscala();
  }

  // data do último commit no GitHub; sem acesso à API, usa a data de publicação da página
  function mostrarDataAtualizacao() {
    const el = $('dataAtualizacao');
    const formatar = (d) => d.toLocaleDateString('pt-BR');
    el.textContent = formatar(new Date(document.lastModified));
    fetch('https://api.github.com/repos/Schuch666/ap_layout/commits?per_page=1')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((dados) => {
        el.textContent = formatar(new Date(dados[0].commit.committer.date));
      })
      .catch(() => {});
  }

  aplicarTema(temaSalvo());
  mostrarDataAtualizacao();
  if (planta.complete) ajustarVista();
  else planta.addEventListener('load', ajustarVista);
  window.addEventListener('resize', ajustarVista);
  desenharTudo();
})();
