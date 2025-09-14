# Registro de Alterações Realizadas - 10/09/2025

Documentando todas as alterações solicitadas e implementadas no projeto:

## 1. Correção de Direcionamento de Páginas

### Página de Usuário
- **Problema**: O botão do avatar do usuário na página principal não estava direcionando corretamente para a página de perfil.
- **Solução**: Corrigido o caminho do link de `/pages/usuario/usuario.html` para `../usuario/usuario.html` no arquivo `pagina-principal.html`.

### Página Sobre
- **Problema**: O link para a página "Sobre nós" na página principal e o botão de voltar na página sobre.html não estavam funcionando corretamente.
- **Solução**: 
  - Corrigido o link no menu da página principal de `/pages/sobre/sobre.html` para `../sobre/sobre.html`
  - Corrigido o link da seta de voltar na página sobre.html de `/pages/pagina-principal/pagina-principal.html` para `../pagina-principal/pagina-principal.html`

## 2. Padronização de Estilos e Cores

### Página de Perfil do Usuário
- **Ajustes de Cores**: Atualizado o esquema de cores da página de perfil do usuário para corresponder ao da página principal:
  - Cores principais: Rosa claro (#FDC1D4) e verde oliva (#ADB447)
  - Suporte completo ao modo escuro com cores apropriadas
- **Renomeação de Arquivo**: Renomeado o arquivo de estilo de `style.css` para `usuario.css` para padronização
- **Correção de Referência**: Atualizado o link no HTML de `style.css` para `usuario.css`

## 3. Padronização de Fontes

### Implementação da Fonte Quicksand
- **Fonte Escolhida**: Quicksand (fonte com bordas arredondadas)
- **Páginas Atualizadas**:
  - Página principal: Adicionada importação da fonte e atualizado o CSS
  - Páginas de autenticação (login, cadastro, redefinir senha): Adicionada importação e atualizado o CSS
  - Página de perfil do usuário: Adicionada importação e atualizado o CSS
  - Página Sobre: Adicionada importação e atualizado o CSS

## 4. Correção de Imagens na Página Sobre

- **Problema**: Imagens dos membros da equipe e ícone de voltar não estavam sendo exibidas
- **Solução**: Corrigidos todos os caminhos das imagens para usar referências relativas corretas apontando para `../pagina-principal/img/`

## 5. Correção de Permissões de Microfone

### Problema
- O site estava solicitando permissões de microfone constantemente ao carregar a página

### Soluções Implementadas
1. **Configuração Inicial**: Alterado o Jitsi Meet para iniciar com áudio silenciado (`startWithAudioMuted: true`)
2. **Carregamento Sob Demanda**: 
   - Removido o carregamento automático do script do Jitsi Meet do HTML
   - Implementado carregamento dinâmico do Jitsi Meet apenas quando o usuário clicar no botão "Entrar no Canal de Voz"
   - Adicionado botão "Entrar no Canal de Voz" que o usuário deve clicar para ativar o canal
3. **Resultado**: O site não solicita mais permissões automaticamente, apenas quando o usuário decide usar o canal de voz

## 6. Ajustes de Layout

### Container do Canal de Voz
- **Aumento de Largura**: Aumentada a largura do container do canal de voz de 385px para 500px para melhor acomodar a interface do Jitsi Meet

### Imagem do Rádio
- **Redução de Tamanho**: Reduzida a largura da imagem do rádio de 150px para 100px para evitar sobreposição com o container do canal de voz

## Resumo

Todas as alterações realizadas visam:
1. Melhorar a usabilidade e navegação entre páginas
2. Padronizar a aparência do site com cores e fontes consistentes
3. Resolver problemas técnicos com permissões do navegador
4. Aprimorar o layout e a disposição dos elementos na interface
5. Manter a consistência visual entre todas as páginas do site

O site agora oferece uma experiência mais coesa, com navegação correta entre páginas, aparência padronizada e melhor controle sobre recursos que requerem permissões do usuário.