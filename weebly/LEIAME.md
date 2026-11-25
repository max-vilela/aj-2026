# Site no Weebly (aj-2026.weebly.com)

Tudo aqui é gerado por `node weebly/montar.js` a partir do material de `tumblr/`.

| Arquivo | Para quê |
|---|---|
| `tema/no-header.html` | Template do tema. Colado em **Tema → Edit HTML/CSS** nos arquivos `header.html` e `no-header.html` (os dois iguais). |
| `style.css` | CSS único do site, servido pelo jsDelivr (`@<commit>/weebly/style.css`). |
| `site.js` | Menu (página atual), Esc, medalhão e voltar ao topo (`@<commit>/weebly/site.js`). |
| `carregamento.js` | Tela de carregamento da Home, com redirect para `/inicio.html`. |
| `paginas/*.html` | Conteúdo de cada página, colado num elemento **Embed Code** da página. `home.html` é a Home (carregamento), `panteao.html` serve todos os deuses. |
| `deuses/` | Um JSON por deus (gerado do Google Docs), os ícones e os scripts de importação. |
| `preview/` | Páginas montadas para conferir no navegador (geradas, fora do git). |

## Como o Weebly foi configurado

- **Tema:** `main.less` esvaziado (só um comentário), para o CSS padrão do tema não interferir.
- **Header Code** (Configurações → SEO): links das fontes, do `style.css` (tag atual) e o `og:image` com o brasão.
- **Páginas:** Home (carregamento) + Início, Trama, Ambientação, Cronologia, Sistemas, Guias, Olimpíadas,
  Legados, Coortes, Senado, Bestiário, Arsenal, Conquistas, Formulários, Núcleos e Agradecimentos.
  Cada uma tem título "Nome | Acampamento Júpiter" e endereço `nome.html`.
- **Hide site from search engines:** ligado.

## Como atualizar

1. Edite `tumblr/style.css` (ou os scripts) e rode `node weebly/montar.js`.
2. Commit e push.
3. Ponha o hash do commit publicado em `TAG`, no topo de `montar.js`, e rode `node weebly/montar.js` de novo.
   O jsDelivr serve qualquer commit por hash, e hash não tem cache velho (tag antiga fica em cache para sempre).
4. Cole `tema/no-header.html` nos dois arquivos do tema e os `paginas/*.html` que mudaram.

## Páginas dos deuses

- O conteúdo sai do Google Docs "AJ ★ Poderes" (uma aba por deus, ✅ = pronto para publicar).
- `node weebly/deuses/importar-doc.js <texto.txt>` gera um JSON por deus e a `lista.json`.
- `node weebly/deuses/sugerir-icones.js` dá o primeiro palpite de ícone (catálogo do Dota 2, fora do git).
- `weebly/deuses/escolher-icones.html` troca os ícones à mão; `aplicar-icones.js` grava a escolha.
- No site é **uma página só**: `panteao.html?deus=netuno`. A janela do Panteão já aponta para cada deus.

## Observações

- O editor do Weebly não mostra o CSS externo; só o site publicado (ou a prévia do editor de código) mostra o visual.
- Senha de site e "Members" exigem plano pago.
- O texto das páginas (menos Cronologia) é provisório.
