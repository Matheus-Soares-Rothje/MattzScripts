# Matt'z Scripts 🚀

Loja virtual de scripts profissionais inspirada na Epic Games Store.

## Estrutura

```
/
├── index.html          # Home page
├── catalogo.html       # Catálogo com filtros
├── produto.html        # Página de produto dinâmica
├── sitemap.xml
├── robots.txt
│
├── assets/
│   ├── css/style.css   # Estilos completos + dark/light theme
│   └── js/main.js      # JavaScript principal
│
└── produtos/
    ├── index.json       # Lista de IDs dos produtos
    ├── discord-bot/info.json
    ├── whatsapp-automation/info.json
    └── ...
```

## Como adicionar produtos

1. Crie uma pasta em `produtos/nome-do-produto/`
2. Adicione um `info.json` com a estrutura:

```json
{
  "id": "nome-do-produto",
  "nome": "Nome do Produto",
  "categoria": "Discord",
  "descricao": "Descrição completa do produto.",
  "preco": "59.90",
  "imagem": "thumb.png",
  "link": "https://pay.kiwify.com.br/xxxxx",
  "destaque": true,
  "lancamento": false,
  "popular": true,
  "emAlta": false,
  "avaliacao": 4.9,
  "avaliacoes": 248,
  "recursos": ["Recurso 1", "Recurso 2"]
}
```

3. Adicione o ID ao `produtos/index.json`

## Deploy no GitHub Pages

1. Faça upload de todos os arquivos para um repositório GitHub
2. Vá em Settings → Pages → selecione a branch `main`
3. O site estará disponível em `https://usuario.github.io/repositorio/`

## Categorias disponíveis

Discord, WhatsApp, Bots, APIs, Automação, Painéis, IA, Web, Jogos, Mobile, Utilitários, Outros

## Funcionalidades

- ✅ Tema escuro/claro com persistência
- ✅ Produtos carregados dinamicamente via JSON
- ✅ Busca instantânea
- ✅ Filtros por categoria
- ✅ Ordenação de produtos
- ✅ Carrossel de destaques
- ✅ Skeleton loading
- ✅ Responsivo (desktop, tablet, mobile)
- ✅ Menu mobile com bottom nav
- ✅ Animações com Intersection Observer
- ✅ SEO completo (meta tags, OG, Twitter Cards)
- ✅ 100% estático, funciona no GitHub Pages
