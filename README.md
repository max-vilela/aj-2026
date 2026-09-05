# Acampamento Júpiter — Guia Oficial do RPG

Site estático (HTML, CSS e JavaScript puros — sem frameworks) que serve como enciclopédia
visual e guia oficial do RPG de Habbo **Acampamento Júpiter**, inspirado no universo romano
de Rick Riordan.

O site é dividido em páginas curtas e independentes, cada uma com um único bloco de conteúdo,
com cabeçalho e menus laterais fixos que não rolam com a página.

## Páginas

| Arquivo | Capítulo |
|---|---|
| `index.html` | Início |
| `o-acampamento.html` | O Acampamento |
| `nova-roma.html` | Nova Roma |
| `coortes.html` | Coortes |
| `deuses.html` | Deuses e Semideuses |
| `personagens.html` | Personagens |
| `regras.html` | Regras do RPG |
| `sistemas.html` | Sistemas (combate, progressão, economia, missões) |
| `patentes.html` | Patentes e Honrarias |
| `missoes.html` | Missões e Eventos |
| `bestiario.html` | Bestiário |
| `glossario.html` | Glossário |
| `creditos.html` | Créditos |
| `mercado.html` | Mercado (perícias, habilidades extras, dons) |
| `legados.html` | Legados (acessado via card no Mercado) |
| `relicario.html` | Relicário — artefatos e metais (idem) |
| `reliquias-pessoais.html` | Relíquias Pessoais (idem) |

## Estrutura do projeto

```
├── index.html, *.html      # uma página por capítulo
├── style.css               # todo o estilo do site
├── script.js               # menu móvel, modais, acordeões, animações de rolagem
├── emblema.png             # logo/favicon do site
├── fundo-arena.png         # ilustração de fundo fixa (cena-fundo)
└── fontes/                 # fontes customizadas usadas via @font-face
```

## Rodando localmente

Como é um site 100% estático, qualquer servidor HTTP simples funciona. Por exemplo, com Python:

```bash
python -m http.server 4173
```

Depois é só abrir `http://localhost:4173` no navegador.

> Abrir os arquivos `.html` diretamente (`file://`) também funciona na maioria dos casos, mas
> um servidor local evita problemas de cache e cross-origin ao carregar as fontes.

## Tecnologias

- HTML semântico, sem frameworks ou bibliotecas externas de JS.
- CSS puro com variáveis (`:root`), Grid/Flexbox e fontes customizadas via `@font-face`.
- JavaScript vanilla para: menu móvel, marcação da página atual no menu, modais, acordeões,
  filtro de conteúdo, barra de progresso animada e revelação suave de elementos ao rolar
  (respeitando `prefers-reduced-motion`).

## Aviso

Projeto de comunidade / fã, sem qualquer vínculo oficial com Rick Riordan, Disney, editoras
ou com a Habbo Hotel / Sulake. Nenhum direito autoral é reivindicado sobre personagens ou
marcas de terceiros.
