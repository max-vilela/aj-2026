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
├── latim.js                # textos em latim da animação latim → português (só dados)
├── script.js               # menu móvel, modais, acordeões, rolagem e a tradução animada (seção 8)
├── emblema.png             # logo/favicon do site
(fundo da arena: hospedado no Imgur, ver .cena-fundo em style.css)
└── (fontes: Google Fonts, via <link> no <head> de cada página)
```

## Fontes

Cinzel (títulos, menus, rótulos), Cinzel Decorative (só o `h1`) e Libre Caslon Text
(texto corrido e lemas em itálico), todas do Google Fonts. Não há arquivo de fonte para hospedar.

## Tradução animada (latim → português)

Ao abrir uma página, títulos, menus e botões aparecem em latim e se traduzem para o português;
nos capítulos, só a **abertura de cada parágrafo** vem em latim e o restante surge palavra por palavra.

- O HTML continua 100% em português (leitores de tela, buscadores e quem está sem JavaScript veem só isso).
- Os textos em latim ficam em `latim.js`. Cada linha é `[português, latim]`; com um terceiro valor `1`,
  a chave é o **início** do parágrafo. Para corrigir uma tradução, edite só o segundo valor.
- Menus e cabeçalho animam uma vez por sessão; o conteúdo anima ao entrar na tela.
- Clique ou tecla encerra a animação; `prefers-reduced-motion` a desliga; o rodapé tem o botão
  "Tradução animada: ligada/desligada" (lembrado no navegador).
- Ao adicionar ou editar texto, mantenha a chave de `latim.js` idêntica ao texto do HTML.
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
- CSS puro com variáveis (`:root`), Grid/Flexbox e fontes do Google Fonts.
- JavaScript vanilla para: menu móvel, marcação da página atual no menu, modais, acordeões,
  filtro de conteúdo, barra de progresso animada e revelação suave de elementos ao rolar
  (respeitando `prefers-reduced-motion`).

## Aviso

Projeto de comunidade / fã, sem qualquer vínculo oficial com Rick Riordan, Disney, editoras
ou com a Habbo Hotel / Sulake. Nenhum direito autoral é reivindicado sobre personagens ou
marcas de terceiros.
