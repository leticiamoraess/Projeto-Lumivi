# Prompt perfeito para o seu agente — **Criação de salas e convites** (detalhado, pronto para implementação)

**Resumo / Objetivo:**  
Implemente o fluxo completo de criação, convite e entrada em salas (grupos) com controles de permissões e moderação. O agente deve entregar backend + endpoints, UI (tela de permissões ao criar), validações, regras de negócio, mensagens UX, testes e documentação mínima para integrar ao produto.

---

## 1) Requisitos funcionais principais (visão rápida)
- Ao entrar no sistema:
  - Se o usuário já tem conta **e** pertence a **um** grupo, redirecionar automaticamente para esse grupo.
  - Se o usuário tem conta **mas não** pertence a nenhum grupo, apresentar opção: **Criar grupo** ou **Entrar em um grupo**.
  - Se o usuário **não tem conta**, redirecionar para a página de **login/registro**.
- Entrar em sala:
  - Usuário pode entrar usando **código da sala** ou **link de convite**.
  - Dependendo das configurações da sala, a entrada pode ser **imediata** ou **pendente** (aguardando aprovação do administrador).
- Criar sala:
  - Ao criar, mostrar **tela de permissões** com opções padrão já selecionadas e editáveis (limite de pessoas, configuração de convite, permissões do calendário, chat aberto/fechado, auto-suspensão por flood, etc).

---

## 2) Fluxos de usuário (detalhados)

### A. Ao abrir o app (autenticação / redirecionamento)
- Se `user.authenticated == false`: redirecionar para `/login`.
- Se `user.authenticated == true`:
  - Se `user.groups.length == 1`: redirecionar para `/rooms/{groupId}`.
  - Se `user.groups.length > 1`: mostrar um seletor de grupos (padrão: último grupo usado).
  - Se `user.groups.length == 0`: mostrar tela com 2 botões: **Criar grupo** | **Entrar em um grupo**.

### B. Entrar em sala existente
- Input: `codigo` ou `invite_link`.
- Validações:
  - Código: formato alfanumérico (sugerido: 8 caracteres, uppercase), verifica existência.
  - Link: UUID ou token seguro com `room_id`.
- Respostas:
  - Se sala `require_approval == false` e `capacity` não ultrapassada → **entrar imediatamente** (`status: joined`).
  - Se sala `require_approval == true` → criar `membership` com `status: pending`, notificar admins (`status: pending`).
  - Se sala cheia → retornar erro `room_full`.
  - Se invite expirado / esgotado → retornar `invite_invalid`.

### C. Criar sala → tela de permissões
- Fluxo:
  1. Usuário clica em **Criar sala** → exibir formulário + tela de permissões.
  2. Opções mostradas com valores **padrão recomendados** (abaixo).
  3. Usuário confirma → POST `/api/rooms` -> sala criada, redirecionar para a sala e gerar link e código.

---

## 3) Configurações da sala (tela de permissões)
- `name` (string) — **Obrigatório**
- `capacity` (int) — **default: 50**
- `require_approval` (bool) — **default: false**
- `invite` (obj):
  - `allow_code_join` (bool) — **default: true**
  - `link_reusable` (bool) — **default: true**
  - `link_single_use` (bool) — **default: false**
  - `show_code_publicly` (bool) — **default: false**
  - `expires_in` (duration | null) — **default: null**
- `calendar_permissions` (enum: `anyone` | `admins_only` | `specific_roles`) — **default: admins_only**
- `chat_open` (bool) — **default: true**
- `auto_suspension` (obj):
  - `enabled` (bool) — **default: true**
  - `threshold_messages` (int) — **default: 5**
  - `within_seconds` (int) — **default: 10**
  - `suspension_seconds` (int) — **default: 60**
- `discoverable` (bool) — **default: false**
- `default_roles` — lista com roles e permissões iniciais (admin, member)

---

## 4) Regras de negócio e validações importantes
- Códigos não podem ser adivinháveis; usar gerador seguro (8 chars alfanum).
- Links de convite: tokens UUIDv4 + HMAC para validação.
- `capacity` deve ser checada **atomically**.
- Invite `max_uses` e `used_count` devem ser atualizados atomically.
- Aprovação/recusa gera evento de auditoria.
- Último admin não pode sair sem transferir ownership.

---

## 5) API — endpoints sugeridos

### POST /api/rooms (criar sala)
```json
{
  "name": "Sala de Estudo - Álgebra",
  "capacity": 50
}
```

### POST /api/rooms/join (entrar por código ou link)
```json
{ "code": "X7K9P2QW" }
```

---

## 6) Modelo de dados sugerido
- **rooms**
- **invites**
- **memberships**
- **moderation_events**
- **audit_logs**

---

## 7) Mensagens UX
- "Você foi redirecionado para sua sala."
- "Solicitação enviada. Aguarde confirmação do administrador."
- "Sala atingiu o limite de participantes."
- "Este link expirou."

---

## 8) Casos de teste
1. Usuário sem conta → redirecionar login.
2. Usuário com conta + grupo → redirecionar grupo.
3. Código válido → entrar.
4. Código válido + require_approval → pending.
5. Invite expirado → erro.

---

## 9) Casos extremos / segurança
- Rate-limit tentativas de join.
- Tokens assinados com HMAC.
- Revogação imediata de invites.

---

## 10) Critérios de aceitação
- Fluxos funcionando e testados.
- API documentada.
- UI clara com defaults.
- Auditoria presente.

---

## 11) Entregáveis
- Endpoints + documentação.
- UI criação/join.
- Banco de dados com migrações.
- Testes automatizados.
- README com instruções.

---

## Observação final
Implemente com foco em **simplicidade UX** e **segurança**, seguindo os valores default propostos e regras de atomicidade.
