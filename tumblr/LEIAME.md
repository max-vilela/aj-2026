# Tema atual do Tumblr (acampamento-jupiter.tumblr.com)

Backup do tema publicado no Tumblr, copiado do personalizador (Personalizar → Editar HTML)
em 21/11/2026. O site no ar é este, e não o tríptico roxo da raiz do repositório.

| Arquivo | O que é |
|---|---|
| `tema-original.html` | Cópia fiel do que estava no Tumblr, com o CSS embutido (backup, não editar). |
| `style.css` | O CSS extraído do tema (idêntico nas 16 páginas publicadas). |
| `tema.html` | HTML atual da raiz do site (a página sem `/`, em Personalizar → Editar HTML): tela de carregamento e redirect para `/inicio`. O CSS vem da nuvem (jsDelivr). |
| `paginas/inicio.html` | HTML atual da página `/inicio`: botão do Panteão como imagem, centralizado numa linha dourada. Sem tela de carregamento. |

A versão anterior da raiz (a Cronologia completa, ainda com o `<style>` embutido) continua em `tema-original.html`.
O Tumblr não aceita `<meta http-equiv="refresh">` no HTML da raiz (dá "Ops! :(" ao salvar), então o redirect é feito só por JavaScript.

## Como o CSS vem da nuvem

`tema.html` aponta para:

```
https://cdn.jsdelivr.net/gh/max-vilela/aj-2026@v1/tumblr/style.css
```

O jsDelivr serve direto o arquivo deste repositório (que é público). O link usa a **tag `v1`**,
então o site só muda quando você decidir. Para atualizar o CSS:

1. Edite `tumblr/style.css`, commite e dê push.
2. Mova a tag para o novo commit: `git tag -f v1 && git push -f origin v1`.
3. O jsDelivr guarda cache por até ~12 h. Para forçar a atualização na hora, abra
   `https://purge.jsdelivr.net/gh/max-vilela/aj-2026@v1/tumblr/style.css`.

Nenhuma página do Tumblr precisa ser tocada. Para um ciclo de mudanças maiores, crie `v2` e
troque `@v1` por `@v2` nas páginas; a `v1` fica como versão de volta.

## Páginas

As 16 páginas (`/inicio`, `/trama`, `/cronologia`…) repetem o mesmo bloco `<style>` de ~30 mil
caracteres. Para migrar cada uma, troque o bloco `<style>…</style>` do HTML da página por:

```html
<link rel="preload" as="style" href="https://cdn.jsdelivr.net/gh/max-vilela/aj-2026@v1/tumblr/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/max-vilela/aj-2026@v1/tumblr/style.css">
```
