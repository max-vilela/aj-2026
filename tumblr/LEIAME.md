# Tema atual do Tumblr (acampamento-jupiter.tumblr.com)

Backup do tema publicado no Tumblr, copiado do personalizador (Personalizar → Editar HTML)
em 21/11/2026. O site no ar é este, e não o tríptico roxo da raiz do repositório.

| Arquivo | O que é |
|---|---|
| `tema-original.html` | Cópia fiel do que estava no Tumblr, com o CSS embutido (backup, não editar). |
| `style.css` | O CSS extraído do tema (idêntico nas 16 páginas publicadas). |
| `tema.html` | O mesmo HTML, sem `<style>`, carregando o CSS pela nuvem (jsDelivr). |

## Como o CSS vem da nuvem

`tema.html` aponta para:

```
https://cdn.jsdelivr.net/gh/max-vilela/aj-2026@main/tumblr/style.css
```

O jsDelivr serve direto o arquivo deste repositório (que é público). Editar o CSS passa a ser:
editar `tumblr/style.css`, commitar e dar push. Nenhuma página do Tumblr precisa ser tocada.

- `@main` guarda cache por até ~12 h. Para forçar a atualização, abra
  `https://purge.jsdelivr.net/gh/max-vilela/aj-2026@main/tumblr/style.css`.
- Para travar uma versão estável, crie uma tag (`git tag v1 && git push origin v1`) e troque
  `@main` por `@v1` nas páginas. A partir daí o site só muda quando você trocar a tag.

## Páginas

As 16 páginas (`/inicio`, `/trama`, `/cronologia`…) repetem o mesmo bloco `<style>` de ~30 mil
caracteres. Para migrar cada uma, troque o bloco `<style>…</style>` do HTML da página por:

```html
<link rel="preload" as="style" href="https://cdn.jsdelivr.net/gh/max-vilela/aj-2026@main/tumblr/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/max-vilela/aj-2026@main/tumblr/style.css">
```
