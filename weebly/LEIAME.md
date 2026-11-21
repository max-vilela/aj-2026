# Site no Weebly (aj-2026.weebly.com)

Tudo aqui é gerado por `node weebly/montar.js` a partir do material de `tumblr/`.

| Arquivo | Para quê |
|---|---|
| `tema/no-header.html` | Template do tema. Colado em **Tema → Edit HTML/CSS** nos arquivos `header.html` e `no-header.html` (os dois iguais). |
| `style.css` | CSS único do site, servido pelo jsDelivr (`@v2/weebly/style.css`). |
| `site.js` | Menu (página atual), Esc, medalhão e voltar ao topo (`@v2/weebly/site.js`). |
| `carregamento.js` | Tela de carregamento da Home, com redirect para `/inicio.html`. |
| `paginas/*.html` | Conteúdo de cada página, colado num elemento **Embed Code** da página. `home.html` é a Home (carregamento). |
| `preview/` | Páginas montadas para conferir no navegador (geradas, fora do git). |

## Como o Weebly foi configurado

- **Tema:** `main.less` esvaziado (só um comentário), para o CSS padrão do tema não interferir.
- **Header Code** (Configurações → SEO): links das fontes e do `style.css`.
- **Páginas:** Home (carregamento) + Início, Trama, Ambientação, Cronologia, Sistemas, Guias, Olimpíadas,
  Legados, Coortes, Senado, Bestiário, Arsenal, Conquistas, Formulários, Núcleos e Agradecimentos.
  Cada uma tem título "Nome | Acampamento Júpiter" e endereço `nome.html`.
- **Hide site from search engines:** ligado.

## Como atualizar

1. Edite `tumblr/style.css` (ou os scripts) e rode `node weebly/montar.js`.
2. Commit e push, depois mova a tag: `git tag -f v2 && git push -f origin v2`.
3. Para forçar o cache do jsDelivr: `https://purge.jsdelivr.net/gh/max-vilela/aj-2026@v2/weebly/style.css`.

## Observações

- O editor do Weebly não mostra o CSS externo; só o site publicado (ou a prévia do editor de código) mostra o visual.
- Senha de site e "Members" exigem plano pago.
- O texto das páginas (menos Cronologia) é provisório.
