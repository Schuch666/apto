<h1 align="center">
  <a href="https://schuch666.github.io/apto/">▶ Abrir o layout do apartamento</a>
</h1>

<p align="center"><a href="https://schuch666.github.io/apto/">schuch666.github.io/apto</a></p>

---

Página para planejar a disposição dos móveis do apartamento: os móveis são desenhados em escala
sobre a planta e podem ser arrastados, girados e duplicados. Funciona direto no navegador,
sem instalação e sem cadastro.

## Como usar

1. Abra o link acima.
2. No **Catálogo**, clique em **+** para colocar um móvel na planta.
3. Arraste o móvel para posicioná-lo. Ao selecionar um móvel, o painel **Selecionado** permite
   mudar nome, medidas, rotação e cor.
4. Para móveis que não estão no catálogo, use **Novo móvel** (comprimento × largura em cm, vistos de cima).

| Ação | Como |
|---|---|
| Mover móvel | arrastar, ou setas (1 cm; com Shift, 10 cm) |
| Girar | `R` (90°) ou `Shift+R` (15°) |
| Duplicar | `D` |
| Excluir | `Delete` |
| Deslocar a planta | arrastar o fundo |
| Zoom | roda do mouse, ou botões − / Ajustar / + |
| Medir distância | **Medir** e clicar em dois pontos |
| Cancelar ferramenta / seleção | `Esc` |

### Salvar e compartilhar

- O layout é salvo automaticamente **no seu navegador**. Outras pessoas que abrirem o link não
  veem o seu arranjo, cada navegador tem o seu.
- **Exportar** baixa o layout em JSON; **Importar** carrega um JSON (para levar a outro computador
  ou enviar a alguém).
- **Salvar PNG** gera uma imagem da planta com os móveis.
- **Salvar / Carregar** guardam e abrem layouts com nome no próprio repositório, na pasta `layouts/`.
  Carregar funciona para qualquer pessoa. Salvar exige um token do GitHub com permissão de escrita
  neste repositório (veja abaixo); por isso, na prática, só o dono do repositório salva.

#### Token para salvar

1. No GitHub: *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*.
2. Em *Repository access*, escolha **Only select repositories** e marque este repositório.
3. Em *Permissions → Repository permissions*, dê **Contents: Read and write**.
4. Gere o token e cole quando a página pedir no primeiro **Salvar**. Ele fica guardado só no navegador
   em que foi colado; se for recusado, a página o esquece e pede de novo.

Cada layout salvo vira um commit na `main`, o que também republica o site.

#### Layout padrão

Um layout salvo com o nome **default** (`layouts/default.json`) é aberto automaticamente na primeira
visita de cada navegador, ou seja, quando ainda não há nada salvo nele. Quem já tem um layout no
navegador continua com o seu; o padrão pode ser aberto a qualquer momento por **Carregar**.

### Escala

A escala inicial (168 px/m) foi estimada pelas cotas do desenho, que não é perfeitamente
proporcional (as cotas indicam entre ~158 e ~176 px/m), então pode haver alguns centímetros de
diferença. Para mais precisão num cômodo, use **Calibrar escala**: clique nas duas pontas de uma
cota daquele cômodo e informe a medida real.

### Tema

O tema escuro é o padrão; o botão **Tema claro / Tema escuro** alterna entre os dois, trocando
também a versão da planta. A escolha fica salva no navegador.

## Rodar localmente

Abra `index.html` com dois cliques. Tudo funciona assim, exceto **Salvar PNG**, que alguns
navegadores bloqueiam quando a página é aberta direto do arquivo. Para isso, rode um servidor
local nesta pasta:

```bash
python3 -m http.server 8000
```

e abra http://localhost:8000.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html`, `style.css`, `app.js` | a aplicação (HTML/CSS/JS puro, sem dependências) |
| `catalogo.js` | móveis padrão (medidas em cm) e escala inicial da planta (px/m) |
| `planta_paredes_janelas_cotas.png` | planta original (tema claro) |
| `planta_escura.png` | planta nas cores do tema escuro, gerada pelo script abaixo |
| `gerar_planta_escura.py` | gera `planta_escura.png` a partir da planta original (requer Pillow) |

## Personalizar

- **Móveis padrão:** edite a lista em `catalogo.js`.
- **Cores:** ficam em variáveis no topo de `style.css` (um bloco para o tema escuro e outro para o
  claro). Se mudar as cores do tema escuro, ajuste `FUNDO`, `PAREDE` e `TEXTO` em
  `gerar_planta_escura.py` e rode:

  ```bash
  python3 gerar_planta_escura.py
  ```

- **Outra planta:** substitua o PNG mantendo o nome (ou altere `PLANTAS` em `app.js`), gere a
  versão escura com o script e recalibre a escala na página.

## Publicação

O site é servido pelo GitHub Pages a partir da branch `main` (pasta raiz). Cada push para a
`main` atualiza a página em alguns minutos.
