# Layout do Apartamento

Página local para posicionar móveis em escala sobre a planta (`planta_paredes_janelas_cotas.png`).

## Como abrir

Dê dois cliques em `index.html`. Tudo funciona assim, exceto **Salvar PNG**, que alguns navegadores
bloqueiam quando a página é aberta direto do arquivo. Para isso, rode um servidor local nesta pasta:

```bash
python3 -m http.server 8000
```

e abra http://localhost:8000.

## Arquivos

- `index.html`, `style.css`, `app.js`: a aplicação (HTML/CSS/JS puro, sem dependências).
- `catalogo.js`: móveis padrão (medidas em cm) e escala inicial da planta (px/m).
- O layout é salvo automaticamente no navegador; use **Exportar/Importar** para guardar em JSON ou levar para outro computador.

## Escala

A escala inicial (168 px/m) foi estimada pelas cotas do desenho, que não está perfeitamente proporcional
(as cotas dão entre ~158 e ~176 px/m). Para mais precisão no cômodo que importa, use **Calibrar escala**
clicando nas pontas da cota daquele cômodo.

## Tema e cores

O tema escuro é o padrão; o botão **Tema claro/escuro** alterna (a escolha fica salva no navegador).
As cores ficam em variáveis no topo de `style.css`: troque os valores para usar outra paleta.

A planta escura (`planta_escura.png`) é gerada a partir da original com as mesmas cores do tema:

```bash
python3 gerar_planta_escura.py
```

Se mudar as cores do tema escuro, ajuste `FUNDO`, `PAREDE` e `TEXTO` no script e rode de novo.

## Trocar a planta

Substitua o PNG mantendo o nome (ou altere `PLANTAS` em `app.js`), rode `gerar_planta_escura.py`
para a versão escura e recalibre a escala.
