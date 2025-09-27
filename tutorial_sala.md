# Tutorial Completo: Implementação da Funcionalidade de Salas no Lumivi

## Visão Geral

Este tutorial detalha todos os passos necessários para implementar a funcionalidade de salas e convites no sistema Lumivi, mantendo a estrutura existente e seguindo o conceito de resolução simples e funcional (Felipe Style).

## Objetivo da Implementação

Implementar o fluxo completo de criação, convite e entrada em salas (grupos) com controles de permissões e moderação, permitindo que diferentes grupos de usuários utilizem as ferramentas do Lumivi (chat, calendário, canal de voz) em ambientes separados.

## Partes Já Implementadas

### 1. Backend de Salas (sala_backend.js)

**Localização:** `C:/Users/felip/Downloads/Projeto-Lumivi-main/Projeto-Lumivi-main/pages/sala_backend.js`

**Funcionalidades:**
- Criação de salas com configurações personalizadas
- Geração automática de códigos de sala (8 caracteres alfanuméricos)
- Adição de usuários a salas
- Verificação de pertencimento a salas
- Busca de salas por código
- Sistema de aprovação pendente (quando ativado)
- Validação de capacidade máxima da sala

**Principais funções:**
- `criarSala(nome, capacidade, configuracoes)`
- `adicionarUsuarioASala(userId, roomId, role)`
- `usuarioPertenceASala(userId, roomId)`
- `obterSalasDoUsuario(userId)`
- `procurarSalaPorCodigo(codigo)`
- `entrarEmSalaPorCodigo(codigo)`
- `gerarCodigoSala()`

### 2. Interface de Gerenciamento de Salas (sala_interface.html)

**Localização:** `C:/Users/felip/Downloads/Projeto-Lumivi-main/Projeto-Lumivi-main/pages/sala_interface.html`

**Funcionalidades:**
- Formulário para criação de novas salas
- Campo para entrada de código de sala
- Listagem das salas às quais o usuário pertence
- Interface intuitiva com campos de configuração

**Elementos:**
- Nome da sala
- Capacidade máxima
- Aprovação de membros
- Permissões de calendário
- Permissões de chat
- Botão para acessar salas

### 3. Lógica da Interface de Salas (sala_interface.js)

**Localização:** `C:/Users/felip/Downloads/Projeto-Lumivi-main/Projeto-Lumivi-main/pages/sala_interface.js`

**Funcionalidades:**
- Integração com o backend de salas
- Validação de formulários
- Exibição de alertas para feedback ao usuário
- Carregamento dinâmico das salas do usuário
- Processamento de requisições de entrada em sala

### 4. Estilos da Interface de Salas (sala_interface.css)

**Localização:** `C:/Users/felip/Downloads/Projeto-Lumivi-main/Projeto-Lumivi-main/pages/sala_interface.css`

**Funcionalidades:**
- Estilo consistente com a identidade visual do Lumivi
- Design responsivo
- Suporte ao modo escuro
- Layout organizado e profissional

### 5. Integração com a Página Principal

**Arquivos modificados:**
- `pagina-principal.html`
- `pagina-principal.css`

**Funcionalidades adicionadas:**
- Botão de acesso à interface de salas no cabeçalho
- Textos descritivos ao lado dos ícones de navegação
- Links funcionais para a interface de salas

### 6. Sistema de Alertas (SweetAlerts)

**Arquivos criados:**
- `alertas.js` (funções utilitárias)
- `alertas.css` (estilos customizados)

**Arquivos modificados:**
- Todos os principais arquivos (auth.js, usuario.js, chat.js, etc.)

**Funcionalidades:**
- Feedback visual profissional para o usuário
- Alertas de sucesso, erro, aviso e confirmação
- Estados de loading para operações assíncronas
- Estilos consistentes com o design do Lumivi

## Requisitos Funcionais Implementados

### 1. Criação de Sala
- ✅ Formulário com campos obrigatórios
- ✅ Configurações padrão com opções editáveis
- ✅ Geração automática de código de sala
- ✅ Atribuição de usuário como administrador da sala

### 2. Entrada em Sala
- ✅ Sistema de código de 8 caracteres
- ✅ Validação de existência da sala
- ✅ Verificação de capacidade máxima
- ✅ Sistema de aprovação pendente (quando configurado)
- ✅ Mensagens de feedback ao usuário

### 3. Gerenciamento de Membros
- ✅ Sistema de papéis (admin, member)
- ✅ Status de membros (active, pending)
- ✅ Validação de pertencimento

### 4. Interface de Usuário
- ✅ Página de gerenciamento de salas
- ✅ Listagem de salas do usuário
- ✅ Botões de acesso direto às salas
- ✅ Design profissional e intuitivo

## Instruções para Implementação Completa

### Passo 1: Configuração do Backend

1. **Estrutura de Dados no Firestore:**
   - Coleção `rooms`: Armazena informações das salas
   - Coleção `memberships`: Armazena a relação entre usuários e salas

2. **Modelo de Dados de Sala:**
   ```javascript
   rooms: {
     id: string,
     nome: string,
     ownerId: string,
     capacidade: number,
     codigo: string,
     configuracoes: {
       require_approval: boolean,
       allow_code_join: boolean,
       calendar_permissions: string,
       chat_open: boolean,
       auto_suspension: object
     },
     createdAt: timestamp,
     updatedAt: timestamp
   }
   ```

3. **Modelo de Dados de Membros:**
   ```javascript
   memberships: {
     userId: string,
     roomId: string,
     role: string,
     status: string,
     joinedAt: timestamp
   }
   ```

### Passo 2: Implementação da Interface

1. **Criação da Página de Gerenciamento de Salas:**
   - Criar `sala_interface.html` com formulário de criação
   - Adicionar seção para entrada por código
   - Implementar listagem das salas do usuário

2. **Estilização:**
   - Criar `sala_interface.css` com estilos consistentes
   - Garantir suporte ao modo escuro
   - Implementar design responsivo

### Passo 3: Integração com o Sistema Existentes

1. **Modificação da Página Principal:**
   - Adicionar botão de acesso à interface de salas
   - Atualizar navegação para incluir link para salas

2. **Sistema de Redirecionamento:**
   - Implementar lógica para direcionar usuário para sala correta
   - Verificar pertencimento a salas

### Passo 4: Validações e Segurança

1. **Validações de Dados:**
   - Verificação de campos obrigatórios
   - Validação de códigos de sala
   - Controle de capacidade máxima

2. **Controles de Segurança:**
   - Autenticação obrigatória
   - Validação de permissões
   - Proteção contra tentativas de força bruta

## Instruções para Implementar o Que Ainda Falta

### Passo 1: Implementar Permissões por Sala nos Módulos Existentes

#### 1.1. Sistema de Chat por Sala
1. **Modificar a estrutura de dados do chat no Firestore:**
   - Adicionar campo `roomId` aos documentos na coleção `chat`
   - Atualizar a consulta para filtrar mensagens por sala

2. **Atualizar o chat.js:**
   ```javascript
   // Modificar a consulta para incluir o filtro por sala
   const roomId = obterIdDaSalaAtual(); // Pegar o ID da sala dos parâmetros da URL ou variável de sessão
   const q = query(
     collection(db, "chat"), 
     where("roomId", "==", roomId), 
     orderBy("timestamp")
   );
   ```

3. **Atualizar a função de envio de mensagens:**
   - Adicionar o `roomId` ao documento da mensagem
   - Garantir que apenas membros da sala possam ver as mensagens

#### 1.2. Sistema de Calendário por Sala
1. **Modificar a estrutura de dados do calendário no Firestore:**
   - Adicionar campo `roomId` aos documentos na coleção `eventos`
   - Atualizar a consulta para filtrar eventos por sala

2. **Atualizar o calendario.js:**
   - Adicionar filtro por sala ao carregar eventos
   - Verificar permissões antes de permitir adicionar/remover eventos

#### 1.3. Sistema de Voz por Sala
1. **Modificar a função loadJitsiMeet() em pagina-principal.js:**
   - Usar o ID da sala para nomear a reunião do Jitsi
   - Isso criará reuniões separadas para cada sala

### Passo 2: Implementar Sistema de Convites Avançados

#### 2.1. Convites por Email
1. **Criar nova coleção `invites` no Firestore:**
   ```javascript
   invites: {
     id: string,
     roomId: string,
     createdBy: string,
     email: string,
     status: "pending" | "used" | "cancelled",
     createdAt: timestamp,
     expiresAt: timestamp (opcional)
   }
   ```

2. **Adicionar função para gerar convite por email em sala_backend.js:**
   ```javascript
   async function gerarConvitePorEmail(roomId, email, userId) {
     // Verificar se o usuário é administrador da sala
     // Criar documento de convite no Firestore
     // Enviar email com link de convite
   }
   ```

#### 2.2. Links de Convite Únicos
1. **Adicionar função para gerar links de convite em sala_backend.js:**
   ```javascript
   async function gerarLinkConvite(roomId, userId, opcoes = {}) {
     // Criar um token único seguro
     // Armazenar no Firestore com as opções (expiração, limite de uso, etc.)
     // Retornar URL com o token
   }
   ```

2. **Adicionar página para processar links de convite:**
   - Criar `convite.html` e `convite.js`
   - Verificar token de convite
   - Processar entrada na sala

### Passo 3: Implementar Moderação Avançada

#### 3.1. Sistema de Banimento
1. **Modificar a coleção memberships para incluir status de banimento:**
   - Adicionar status "banned" ao campo status

2. **Adicionar funções de moderação em sala_backend.js:**
   ```javascript
   async function banirUsuario(roomId, userId, adminId) {
     // Verificar se quem está banindo é admin
     // Atualizar status do usuário para "banned"
   }

   async function desbanirUsuario(roomId, userId, adminId) {
     // Verificar se quem está desbanindo é admin
     // Atualizar status do usuário para "active"
   }
   ```

#### 3.2. Controle de Conteúdo no Chat
1. **Adicionar função de moderação de mensagens:**
   ```javascript
   async function moderarMensagem(roomId, messageId, acao, adminId) {
     // Remover mensagem ou suspender usuário
   }
   ```

### Passo 4: Implementar Integração Completa

#### 4.1. Redirecionamento Automático
1. **Modificar o comportamento da página principal:**
   - No carregamento da página, verificar número de salas do usuário
   - Se tiver 1 sala, redirecionar automaticamente
   - Se tiver mais de 1 sala, mostrar seletor de salas
   - Se não tiver salas, redirecionar para interface de salas

2. **Exemplo de implementação:**
   ```javascript
   // Em pagina-principal.js
   document.addEventListener('DOMContentLoaded', async () => {
     const usuario = auth.currentUser;
     if (usuario) {
       const salas = await obterSalasDoUsuario(usuario.uid);
       
       if (salas.length === 0) {
         // Redirecionar para interface de salas
         window.location.href = '../pages/sala_interface.html';
       } else if (salas.length === 1) {
         // Redirecionar automaticamente para a sala
         // Aqui você pode definir a sala ativa
       } else {
         // Mostrar seletor de salas
       }
     }
   });
   ```

#### 4.2. Seletor de Salas Ativas
1. **Criar componente para seleção de sala:**
   - Adicionar no cabeçalho ou menu lateral
   - Permitir troca entre salas ativas

### Passo 5: Implementar Recursos Adicionais

#### 5.1. Sistema de Notificações
1. **Criar coleção `notifications` no Firestore:**
   ```javascript
   notifications: {
     id: string,
     userId: string,
     roomId: string,
     type: string, // "message", "event", "mention", etc.
     title: string,
     content: string,
     read: boolean,
     createdAt: timestamp
   }
   ```

2. **Adicionar ícone de notificações na interface:**
   - No header da página principal
   - Mostrar contador de notificações não lidas

#### 5.2. Histórico de Mensagens por Sala
1. **Implementar paginação no chat:**
   - Carregar mensagens em blocos
   - Adicionar botão para carregar mais mensagens

2. **Adicionar busca no histórico:**
   - Campo de busca para procurar mensagens antigas

### Passo 6: Testes e Validação

1. **Testar todos os fluxos de usuário:**
   - Criação de sala
   - Entrada por código
   - Convites por email
   - Funcionalidades de moderação
   - Permissões diferenciadas

2. **Verificar segurança:**
   - Somente membros da sala podem ver o conteúdo
   - Somente administradores podem banir usuários
   - Validação adequada em todas as operações

3. **Testar responsividade:**
   - Verificar se tudo funciona em dispositivos móveis
   - Confirmar que os layouts se adaptam corretamente

## Configurações Padrão Implementadas

### Configurações de Sala
- **Capacidade:** 50 participantes (padrão)
- **Aprovação necessária:** Não (padrão)
- **Permissão para entrada por código:** Sim (padrão)
- **Permissões de calendário:** Apenas administradores (padrão)
- **Chat aberto:** Sim (padrão)

### Recursos de Moderação
- **Sistema de suspensão automática:** Ativado (padrão)
- **Limite de mensagens:** 5 mensagens em 10 segundos (padrão)
- **Tempo de suspensão:** 60 segundos (padrão)

## Fluxos de Usuário Implementados

### A. Acesso à Página de Salas
1. Usuário acessa a página principal
2. Clica no botão "Salas" no cabeçalho
3. É direcionado para `sala_interface.html`

### B. Criação de Sala
1. Usuário preenche os campos do formulário
2. Clica em "Criar Sala"
3. Sistema faz validações
4. Criação da sala no Firestore
5. Usuário é adicionado como administrador
6. Exibição de mensagem de sucesso

### C. Entrada em Sala por Código
1. Usuário digita código de 8 caracteres
2. Clica em "Entrar na Sala"
3. Sistema verifica existência da sala
4. Valida se sala permite entrada por código
5. Verifica capacidade
6. Adiciona usuário como membro ativo ou pendente
7. Exibe mensagem apropriada

### D. Visualização de Salas
1. O sistema carrega automaticamente as salas do usuário
2. Lista é exibida com nome, código e informações da sala
3. Botão "Acessar Sala" permite entrar na sala específica

## Funcionalidades Ainda Não Implementadas

### 1. Sistema de Permissões por Sala
- **Permissões diferenciadas no chat:** Atualmente, o chat é compartilhado entre todos os usuários, não separado por salas
- **Permissões diferenciadas no calendário:** O calendário não é segmentado por salas, todos os eventos aparecem para todos os usuários
- **Permissões diferenciadas no canal de voz:** O canal de voz não está ligado às salas, todos acessam o mesmo canal

### 2. Sistema de Convites Avançados
- **Convites por email:** Atualmente, só é possível entrar por código
- **Links de convite únicos e expiráveis:** Não implementado sistema de geração de links personalizados
- **Controle de uso de convites:** Não há limites de uso ou validade para convites

### 3. Moderação Avançada
- **Sistema de banimento:** Não implementado controle de moderação completo
- **Controle de conteúdo:** Não há filtragem ou moderação de mensagens
- **Histórico de moderação:** Não há registro de ações de moderação

### 4. Integração Completa com o Sistema
- **Redirecionamento automático:** Não implementado redirecionamento baseado no número de salas do usuário
- **Seleção de salas ativas:** Não há sistema para selecionar entre múltiplas salas
- **Painel de administração:** Não há interface para gerenciar membros e configurações avançadas

### 5. Recursos Adicionais
- **Notificações por sala:** Sistema de notificações não implementado
- **Histórico de mensagens por sala:** O chat atual não é segmentado por sala
- **Configurações avançadas:** Mais opções de configuração da sala não implementadas

## Melhorias Futuras Sugeridas

### 1. Recursos Avançados
- Sistema de convites por email
- Permissões granulares para diferentes funções
- Histórico de atividades
- Sistema de banimento e moderação

### 2. Melhorias na Interface
- Design mais sofisticado para a página de salas
- Filtros e ordenação de salas
- Painel de administração de membros

### 3. Integração com Outras Funcionalidades
- Permissões específicas para cada sala nos módulos (chat, calendário, voz)
- Sistema de notificações por sala
- Histórico de mensagens por sala

## Considerações Finais

A implementação atual fornece uma base sólida para o sistema de salas no Lumivi, com foco em simplicidade e funcionalidade. O código está organizado, documentado e integrado com o sistema existente, permitindo que diferentes grupos utilizem as ferramentas do Lumivi em ambientes separados.

A abordagem do Felipe Style (resoluções simples e funcionais) foi mantida em toda a implementação, com funcionalidades essenciais implementadas de forma eficiente e com baixa complexidade técnica.