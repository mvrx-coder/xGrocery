# xGrocery - Especificação Técnica para Implementação

> Documento para entrega ao Claude Code CLI. Consolida a lógica acordada com a referência visual do protótipo desenvolvido no v0.

---

## 1. Visão geral

xGrocery é um app de lista de compras familiar, mobile-first, de uso doméstico contínuo. Não há conceito de "lista nova": existe uma única lista permanente onde cada item alterna entre dois estados: **ativo** (a comprar agora) e **inativo** (não precisa no momento). Quatro membros da família acessam a mesma lista a partir de dispositivos diferentes.

Roda no servidor próprio do usuário, no mesmo padrão dos demais X systems (xField, xFinance, xReview).

## 2. Stack técnica obrigatória

**Backend**:
- Python 3.11+
- FastAPI
- SQLite via SQLModel ou SQLAlchemy
- Uvicorn como ASGI server

**Frontend**:
- React 18 com TypeScript
- Vite (NÃO Next.js, apesar do protótipo v0 ter sido feito em Next)
- Tailwind CSS v3 ou v4
- Framer Motion para animações
- Estrutura padronizada com os demais X systems

**Justificativa**: manter consistência arquitetural com xField, xFinance, xReview e meal-planning app. O protótipo v0 foi gerado em Next.js 16 + React 19 apenas para validar UI, deve ser reimplementado nesta stack.

## 3. Modelo de dados

### 3.1 Tabela `categories`

Campos:
- `id` INTEGER PRIMARY KEY
- `nome` TEXT NOT NULL UNIQUE
- `cor` TEXT NOT NULL (hex, ex: "#10b981")
- `ordem_exibicao` INTEGER DEFAULT 0
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 3.2 Tabela `items`

Campos:
- `id` INTEGER PRIMARY KEY
- `nome` TEXT NOT NULL
- `categoria_id` INTEGER NOT NULL REFERENCES categories(id)
- `ativo` BOOLEAN DEFAULT FALSE
- `quantidade` INTEGER DEFAULT 1 (ver §15, Ponto 1 a confirmar)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Índices: `categoria_id`, `ativo`, `nome`.

### 3.3 Tabela `settings`

Linha única (id sempre = 1):
- `id` INTEGER PRIMARY KEY (fixo em 1)
- `paleta` TEXT NOT NULL (valores: "nocturne", "ocean", "neon")
- `estilo_diferenciacao` TEXT NOT NULL (valores: "elevated", "border", "status")

## 4. API REST

Todos os endpoints retornam JSON. Erros seguem padrão FastAPI (HTTPException com status_code e detail).

### 4.1 Itens

- `GET /api/items` - retorna todos os itens com a categoria embutida (join).
- `POST /api/items` - cria item. Body: `{ nome, categoria_id, ativo, quantidade }`.
- `PATCH /api/items/{id}` - atualização parcial (qualquer campo).
- `DELETE /api/items/{id}` - remove definitivamente.

### 4.2 Categorias

- `GET /api/categories` - lista todas, ordenadas por `ordem_exibicao`.
- `POST /api/categories` - cria. Body: `{ nome, cor, ordem_exibicao }`.
- `PATCH /api/categories/{id}` - atualização parcial.
- `DELETE /api/categories/{id}` - bloquear se houver itens vinculados (retornar 409 Conflict).

### 4.3 Configurações

- `GET /api/settings` - retorna a linha única.
- `PATCH /api/settings` - atualiza paleta e/ou estilo.

### 4.4 Saúde

- `GET /api/health` - retorna `{ "status": "ok" }`.

## 5. Comportamento da tela principal

### 5.1 Estrutura visual

Tela única, mobile-first, rolagem contínua. Topo fixo (header sticky) contendo:
- Barra de busca em destaque.
- Botão "+" à direita da busca.
- Botão de funil para expandir filtro por categoria.
- Botão de engrenagem para abrir configurações.

Abaixo do header, lista contínua dividida em duas zonas visuais:

**Zona superior (itens ativos):**
- Itens marcados como "a comprar".
- Cada item exibe a cor da sua categoria via dot, borda ou tint (depende do estilo selecionado).
- Sem cabeçalhos de categoria (decisão do v0, ver §15 Ponto 2).
- Ordem: alfabética por nome, dentro de blocos visuais por categoria (categorias agrupadas naturalmente pela cor, mas sem separadores explícitos).

**Zona inferior (itens inativos):**
- Todos os itens não marcados.
- Ordem alfabética simples por nome.
- Visual atenuado conforme o estilo de diferenciação selecionado.

### 5.2 Toque simples em item

- Item inativo → ativo: transição animada (spring physics) para a zona superior, na posição alfabética.
- Item ativo → inativo: transição animada para a zona inferior, na posição alfabética.

### 5.3 Long press em item

Abre menu de contexto com duas opções:
- **Editar**: abre drawer/modal para alterar nome, categoria e quantidade.
- **Excluir**: pede confirmação ("Excluir [nome]?" Sim/Cancelar). Única ação com confirmação.

### 5.4 Busca

Campo de texto no header. Filtra a lista em tempo real conforme digita:
- Substring no nome do item.
- Case-insensitive.
- Ignora acentos (ex: "acucar" encontra "Açúcar"). Implementar via normalize NFD + remoção de diacríticos.
- Filtra simultaneamente as duas zonas (ativa e inativa).
- A estrutura de ordenação é preservada nos resultados filtrados.
- Botão "x" dentro do campo para limpar a busca.

### 5.5 Botão "+"

- **Toque simples**: abre drawer para cadastrar novo item. Se houver texto na busca, pré-preenche o campo nome. Novo item entra no estado **ativo** por padrão.
- **Long press**: abre drawer para cadastrar nova categoria (nome + seleção de cor entre 12 opções predefinidas).

### 5.6 Filtro por categoria

Painel expansível (controlado pelo botão de funil) com:
- Botão "Todas" como primeiro item (limpa o filtro).
- Dots coloridos de cada categoria.
- Toque em um dot filtra a lista para mostrar apenas itens daquela categoria.
- O painel se recolhe automaticamente ao selecionar uma categoria.
- Suporta múltiplas linhas conforme o número de categorias cresce.

### 5.7 Configurações (engrenagem)

Drawer ou tela secundária contendo:
- Seleção de **paleta**: Nocturne Premium, Deep Ocean, Neon Edge.
- Seleção de **estilo de diferenciação ativo/inativo**: Elevated & Glow, Border & Accent, Status Indicator.
- Modo **comparação lado a lado**: visualiza simultaneamente todas as combinações de paleta e estilo.
- Botões para salvar ou cancelar.

## 6. Diferenciação visual ativo vs inativo

Três estilos selecionáveis em configurações:

**6.1 Elevated & Glow**
- Item ativo: sombra elevada + gradiente sutil + dot colorido + leve glow na cor da categoria.
- Item inativo: card plano, sem sombra, fundo atenuado.

**6.2 Border & Accent**
- Item ativo: borda lateral colorida (4px) na cor da categoria + checkmark + peso de fonte aumentado.
- Item inativo: sem borda, fonte regular.

**6.3 Status Indicator**
- Item ativo: dot pulsante (animação contínua) + tint sutil de fundo na cor da categoria.
- Item inativo: dot apagado + fundo neutro.

Os tokens visuais exatos (cores, sombras, easings) devem ser importados do protótipo v0.

## 7. Animações (Framer Motion)

Animações obrigatórias:

- **Transição entre zonas**: quando item muda de estado, ele se move suavemente entre as duas zonas. Use `layout` prop do Framer Motion com spring physics (`type: "spring"`, `stiffness: ~300`, `damping: ~30`).
- **Reordenação alfabética**: ao entrar/sair de uma zona, itens vizinhos animam para acomodar a nova posição.
- **Aparecimento progressivo no filtro**: itens que casam com a busca aparecem com fade-in escalonado (stagger).
- **Drawer**: slide-in lateral ou de baixo para cima ao cadastrar item/categoria.
- **Feedback de toque**: ripple ou scale-down sutil ao tocar (0.97 com retorno por spring).
- **Long press**: indicador visual de progresso (anel preenchendo ou scale-up gradual) durante os ~500ms necessários para acionar.

## 8. Sincronização multiusuário

Estratégia: **polling** a cada 15 segundos via `GET /api/items`.

- Não há locking nem resolução de conflito complexa: última escrita ganha.
- Não há WebSocket nem SSE.
- Pausa o polling quando o app está em background (visibility API).
- Retoma imediatamente ao voltar para foreground (com refresh imediato).

## 9. Hardcode inicial (seed)

Script de seed para popular o banco no primeiro deploy:

Categorias iniciais (com cores sugeridas, ajustar conforme paleta):
- Limpeza
- Frios
- Alimentação
- Bebidas
- Descartáveis
- Hortifruti
- Padaria
- Higiene

Itens iniciais: lista de 40 a 60 itens comuns de uma família brasileira, distribuídos pelas categorias. Todos no estado **inativo** no seed.

A lista exata fica a critério da implementação, com base em itens domésticos comuns (arroz, feijão, leite, pão, sabão em pó, papel higiênico, refrigerante, etc.).

## 10. Estrutura do projeto

Sugestão de organização:

```
xgrocery/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── routers/
│   │   │   ├── items.py
│   │   │   ├── categories.py
│   │   │   └── settings.py
│   │   └── seed.py
│   ├── requirements.txt
│   └── xgrocery.db (gerado)
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── styles/
│   │   └── api/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
└── README.md
```

## 11. Deploy

Padrão dos demais X systems no servidor próprio. A definir no momento do deploy:
- Backend como serviço systemd ou container Docker.
- Frontend buildado estaticamente e servido pelo mesmo servidor (FastAPI servindo `dist/` em rota catchall) ou por Nginx separado.
- HTTPS via certificado próprio ou Tailscale.

## 12. Conector MCP (fase posterior)

Após o app funcionando, criar conector MCP para permitir comandos do Claude:
- "adicione [item] à lista"
- "o que está na lista?"
- "remova [item] da lista"
- "marque [item] como comprado"

Fora do escopo desta entrega inicial. Anotar para próxima iteração.

## 13. Aproveitamento do protótipo v0

Importar diretamente do código do v0:
- **Paletas de cores**: Nocturne Premium, Deep Ocean, Neon Edge (tokens Tailwind exatos).
- **Componentes visuais**: estrutura de cards, dots, drawers, botões.
- **Animações**: timings, easings e parâmetros de spring do Framer Motion.
- **Layout**: grid de 12 cores para criação de categoria, alvos de toque 48x48px, padding compacto.

Adaptar/remover:
- Substituir Next.js por Vite.
- Substituir React 19 por React 18 (compatibilidade mais ampla com bibliotecas).
- Conectar componentes a fetch real na API, eliminar mocks em memória.
- Garantir que toda interação dispara a chamada de API correspondente.

## 14. Critérios de aceite

A implementação é considerada completa quando:

1. Os 4 dispositivos da família conseguem acessar a mesma lista pela URL do servidor.
2. Marcar/desmarcar item reflete nos outros dispositivos em até 30 segundos.
3. Busca filtra ignorando acentos.
4. CRUD de itens e categorias funciona via UI.
5. Long press em item abre menu editar/excluir corretamente.
6. Long press no "+" abre cadastro de categoria.
7. Animações fluidas (sem teleporte) na transição entre zonas.
8. Configurações de paleta e estilo persistem entre sessões.
9. Seed inicial popula o banco corretamente no primeiro start.
10. Sem em-dash em qualquer texto de UI ou mensagem.

## 15. Pontos para Marcus confirmar antes da implementação

Estes pontos divergem da spec lógica original (rodadas 1 a 4) por terem sido introduzidos no protótipo v0:

**Ponto 1: Quantidade nos itens**
- Spec original: sem quantidade, apenas marcador booleano.
- V0 implementou: badge inline "6x" antes do nome.
- Decisão a confirmar: incluir campo `quantidade` ou remover?

**Ponto 2: Agrupamento por subcategoria na zona ativa**
- Spec original: itens ativos agrupados por subcategoria com cabeçalho visível, ordem alfabética dentro de cada bloco.
- V0 implementou: sem cabeçalhos. Cor da categoria comunica visualmente o agrupamento via dot/borda/tint.
- Decisão a confirmar: manter abordagem do v0 (mais limpa visualmente, menos explícita) ou voltar aos cabeçalhos?

**Ponto 3: Múltiplas paletas e estilos configuráveis**
- Spec original: paleta única definida pelo desenvolvedor.
- V0 implementou: 3 paletas + 3 estilos selecionáveis pelo usuário em configurações.
- Decisão a confirmar: manter as 9 combinações configuráveis ou fixar uma combinação preferida (qual)?

**Ponto 4: Filtro por categoria via dots**
- Não estava na spec original.
- V0 adicionou: painel expansível com dots por categoria + botão "Todas".
- Decisão a confirmar: manter ou remover?

**Ponto 5: Categorias adicionais no seed**
- Spec original mencionou 5 categorias.
- V0 implícito ou nova proposta inclui hortifruti, padaria, higiene.
- Decisão a confirmar: lista final de categorias do seed.

---

**Última atualização**: maio/2026.
**Stack alvo**: FastAPI + SQLite + React/TypeScript/Vite + Tailwind + Framer Motion.
**Pré-requisito**: confirmar §15 antes de iniciar implementação.
