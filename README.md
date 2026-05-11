# xGrocery — Lista de Compras da Família

App web mobile-first para a família manter uma única lista de compras compartilhada. Cada item alterna entre **ativo** (a comprar) e **inativo**. Quatro membros da família acessam a mesma lista a partir de dispositivos diferentes.

## Stack

- Backend: FastAPI + SQLAlchemy + SQLite (`xGroceryDB.db`)
- Frontend: React 19 + Vite + Tailwind 3 + Framer Motion
- Auth: token simples em memória, senha do Wi-Fi de casa (mesma do xMeal)
- Sem WebSocket — polling 15s no frontend (pausa quando aba oculta ou drawer de quantidade aberto)

## Estrutura

```
x_grocery/
├── backend/             # FastAPI (porta 8062)
│   ├── main.py
│   ├── db.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed.py          # bootstrap dos 4 usuários + 8 categorias + ~50 itens
│   ├── auth.py
│   └── routers/
│       ├── auth.py
│       ├── items.py
│       ├── categories.py
│       └── settings.py
├── xgrocery-client/     # React (porta 5178)
└── start-xgrocery.bat   # sobe backend + frontend
```

## Rodar local

### 1. Dependências (uma vez só)

```bash
cd backend
pip install -r requirements.txt

cd ../xgrocery-client
npm install
```

### 2. Subir o app

Duplo-clique em `start-xgrocery.bat` ou em terminais separados:

```bash
# terminal 1 (raiz x_grocery/)
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8062

# terminal 2
cd xgrocery-client && npm run dev
```

Acesse:

- Frontend: http://localhost:5178
- Backend: http://localhost:8062
- Outros dispositivos da rede: `http://<IP-da-máquina>:5178`

## Usuários (seed automático no primeiro start)

| Nome            |
| --------------- |
| Marcus Vinícius |
| Marilane        |
| Aline           |
| Lívia           |

Senha única para todos (definida em `backend/auth.py`, mesma do xMeal).

## Como usar

- **Login:** clica no nome, digita a senha.
- **Marcar/desmarcar item:** toque simples no card alterna entre ativo (zona superior) e inativo (zona inferior). Ao desativar, a quantidade é zerada.
- **Definir quantidade:** **long press (≈500ms) em um item ativo** abre o drawer "_Nome_, você quer quantos desse?". Digita o número e salva. Long press em item inativo é ignorado.
- **Editar/excluir item:** botão `⋮` no card abre menu com Editar e Excluir. Excluir pede confirmação.
- **Buscar:** campo no topo filtra por nome (ignora acentos).
- **Adicionar item:** toque simples no `+` (verde). Se houver texto na busca, o nome vem pré-preenchido.
- **Adicionar categoria:** long press no `+` abre drawer com 12 cores pré-definidas.
- **Filtrar por categoria:** botão de funil expande dots coloridos; toque em um filtra; "Todas" limpa.
- **Configurações:** engrenagem no topo direito — escolhe paleta (3 opções) e estilo visual (3 opções), totalizando 9 combinações configuráveis.

## Notas

- Polling automático a cada 15s — pausa quando a aba está oculta ou o drawer de quantidade está aberto.
- Quando o backend recebe `PATCH ativo=false`, ele zera `quantidade` no servidor (não confia no cliente) — `frontend → atualização otimista` segue o mesmo princípio.
- Sessões ficam em memória — restart do backend faz todos relogarem.
- O frontend usa atualização otimista para toggle e exclusão. Se a chamada falhar, reverte.

## Roadmap

- Conector Cloudflare Tunnel para acesso externo (a fazer; padrão xMeal).
- Conector MCP para comandos via Claude ("adicione X à lista", "o que está na lista?").
