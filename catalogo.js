// Catálogo padrão de móveis. Medidas em centímetros (comprimento × largura, vistas de cima).
// forma: 'retangulo' (padrão), 'circulo' (vira elipse se comprimento ≠ largura) ou
// 'porta-dir' / 'porta-esq' (1/4 de círculo: dobradiça no canto de baixo, folha abrindo para o lado indicado).
// Para acrescentar itens fixos, adicione linhas aqui; itens criados pela página ficam salvos no navegador.
window.CATALOGO_PADRAO = [
  { nome: 'Cama Queen', larg: 158, prof: 198, cor: '#c98a4f' },
  { nome: 'Banco', larg: 40, prof: 40, cor: '#9ccc65', forma: 'circulo' },
  { nome: 'Cadeira de escritório', larg: 65, prof: 65, cor: '#2e7d32' },
  { nome: 'Cadeira de jantar', larg: 50, prof: 50, cor: '#4caf50', forma: 'circulo' },
  { nome: 'Cadeira de praia', larg: 60, prof: 75, cor: '#00a676' },
  { nome: 'Criado-mudo', larg: 45, prof: 40, cor: '#64a6e8' },
  { nome: 'Mesa de bar', larg: 60, prof: 60, cor: '#3d7fc9', forma: 'circulo' },
  { nome: 'Porta (direita)', larg: 80, prof: 80, cor: '#9aa2ac', forma: 'porta-dir' },
  { nome: 'Porta (esquerda)', larg: 80, prof: 80, cor: '#9aa2ac', forma: 'porta-esq' },
];

// Cores disponíveis para os móveis: cada linha é um tom em claro, médio e escuro
// (saturação moderada; luminosidade ~62%, ~52% e ~36%).
window.PALETA = [
  ['#daa16c', '#c98a4f', '#8e5a29'], // madeira
  ['#dabf6c', '#c4a445', '#8e7529'], // amarelo
  ['#9ccc65', '#89c445', '#5f8e29'], // verde-limão
  ['#81c784', '#4caf50', '#2e7d32'], // verde
  ['#6cdabb', '#45c4a0', '#00a676'], // verde-água
  ['#64a6e8', '#3d7fc9', '#1f5fa8'], // azul
  ['#a06cda', '#8045c4', '#58298e'], // roxo
  ['#da6c75', '#c44550', '#8e2932'], // vermelho
  ['#9aa2ac', '#737d8c', '#535a65'], // cinza
];

// Escala inicial da planta (pixels da imagem por metro), estimada pelas cotas do desenho.
// Use "Calibrar escala" na página para ajustar.
window.ESCALA_PADRAO = 168;
