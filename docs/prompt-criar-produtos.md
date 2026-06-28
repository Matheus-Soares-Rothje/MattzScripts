# Prompt — Criar Novo Produto (ScriptStore)

Use este prompt sempre que quiser que uma IA gere um novo produto para a loja.
Basta preencher os campos entre `[ ]` e colar tudo de uma vez.

---

## PROMPT

```
Você vai criar um novo produto para a loja ScriptStore (loja de scripts estática, dados em JSON).

Gere o conteúdo de um arquivo info.json seguindo EXATAMENTE este schema, sem
adicionar nem remover nenhum campo, e sem alterar os nomes das chaves:

{
  "id": "slug-do-produto",
  "nome": "Nome do Produto",
  "categoria": "slug-da-categoria",
  "categoriaLabel": "Label da Categoria",
  "icone": "nome-do-icone-lucide",
  "preco": 0.00,
  "avaliacao": 0.0,
  "vendas": 0,
  "destaque": false,
  "novo": true,
  "maisVendido": false,
  "descricaoCurta": "Uma frase curta (até ~140 caracteres) resumindo o produto.",
  "descricao": "Um parágrafo mais completo explicando o que o produto faz.",
  "tags": ["tag1", "tag2", "tag3"],
  "recursos": [
    "Recurso 1",
    "Recurso 2",
    "Recurso 3",
    "Recurso 4",
    "Recurso 5"
  ],
  "dataLancamento": "AAAA-MM-DD"
}

REGRAS OBRIGATÓRIAS:

1. "id" deve ser um slug único (minúsculo, sem acento, palavras separadas por
   hífen), igual ao nome da pasta do produto. Nunca repita um "id" já existente.

2. "categoria" DEVE ser exatamente um destes 12 valores (não invente outros):
   discord | whatsapp | bots | paineis | websites | sistemas | automacao |
   jogos | mobile | ia | banco-de-dados | outros

3. "categoriaLabel" deve corresponder à categoria escolhida, exatamente assim:
   discord         -> "Discord"
   whatsapp        -> "WhatsApp"
   bots            -> "Bots"
   paineis         -> "Painéis"
   websites        -> "Websites"
   sistemas        -> "Sistemas"
   automacao       -> "Automação"
   jogos           -> "Jogos"
   mobile          -> "Mobile"
   ia              -> "IA"
   banco-de-dados  -> "Banco de Dados"
   outros          -> "Outros"

4. "icone" deve ser um nome válido de ícone da biblioteca Lucide Icons
   (https://lucide.dev/icons), em kebab-case (ex: "message-circle", "bot",
   "server", "globe", "workflow", "gamepad-2", "smartphone", "brain-circuit",
   "database", "package"). Escolha um ícone que represente bem o produto.

5. "preco" é número decimal (use ponto, não vírgula). "avaliacao" vai de 0.0
   a 5.0 (uma decimal). "vendas" é inteiro.

6. "destaque", "novo" e "maisVendido" são booleanos. Use bom senso: um
   produto recém-lançado normalmente é "novo": true e os outros dois false.

7. "tags" deve ter entre 3 e 5 palavras-chave em minúsculo.

8. "recursos" deve ter entre 4 e 6 itens, cada um uma frase curta e objetiva
   (sem ponto final), descrevendo uma funcionalidade real do produto.

9. "dataLancamento" no formato ISO "AAAA-MM-DD".

10. Não invente categorias, ícones de bibliotecas diferentes (Font Awesome,
    emojis etc.) ou campos fora do schema acima.

Dados do produto que você deve gerar:
- Nome: [NOME DO PRODUTO]
- Categoria: [discord / whatsapp / bots / paineis / websites / sistemas / automacao / jogos / mobile / ia / banco-de-dados / outros]
- Preço: [VALOR, ex: 99.90]
- Resumo do que o produto faz: [DESCREVA EM 1-2 FRASES O QUE O SCRIPT FAZ]

Devolva SOMENTE o JSON final, sem comentários, sem markdown, sem texto antes
ou depois.
```

---

## Depois que a IA devolver o JSON

1. Crie uma pasta dentro de `produtos/` com o mesmo slug do campo `"id"`.
   Exemplo: `produtos/bot-moderador-pro/`

2. Salve o JSON gerado dentro dela como `info.json`.
   Exemplo: `produtos/bot-moderador-pro/info.json`

3. Abra `produtos/index.json` e adicione o novo slug na lista `"produtos"`:

```json
{
  "produtos": [
    "bot-moderador-pro",
    "...outros já existentes...",
    "novo-produto-aqui"
  ]
}
```

Pronto — o site carrega tudo via `fetch()` automaticamente, sem precisar
tocar em nenhum HTML, CSS ou JS.

---

## Prompt extra — Zipar a pasta correta

Se você for gerar os produtos em outro ambiente (ex: outra sessão de IA com
acesso a terminal) e quiser apenas o pacote para subir/mesclar no projeto,
use este prompt complementar:

```
Compacte (zip) APENAS a pasta "produtos/" inteira — incluindo o arquivo
"produtos/index.json" atualizado e todas as subpastas de produtos
(cada uma com seu "info.json") — em um único arquivo chamado produtos.zip.

Não inclua nenhum outro arquivo do projeto (index.html, catalogo.html,
produto.html, assets/, sitemap.xml, robots.txt etc.) — somente o conteúdo
de dentro de "produtos/".

Estrutura esperada dentro do zip:

produtos/
  index.json
  slug-produto-1/
    info.json
  slug-produto-2/
    info.json
  ...

Ao final, gere o link de download do produtos.zip.
```

Com isso você consegue gerar lotes de produtos novos separadamente e só
substituir a pasta `produtos/` do projeto pelo conteúdo do zip, sem
arriscar sobrescrever nenhum outro arquivo do site.
