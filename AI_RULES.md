# 🤖 Regras para Desenvolvimento da Aplicação

Este documento descreve o stack tecnológico da aplicação e as regras de uso das bibliotecas para garantir consistência, manutenibilidade e boas práticas de desenvolvimento.

## 🚀 Stack Tecnológico

A aplicação é construída com as seguintes tecnologias e ferramentas:

*   **Frontend Framework**: React 18 com TypeScript para uma interface de usuário robusta e tipada.
*   **Build Tool**: Vite para um ambiente de desenvolvimento rápido e builds otimizados.
*   **Estilização**: Tailwind CSS para um desenvolvimento de UI rápido e consistente com classes utilitárias.
*   **Componentes de UI**: Shadcn/ui para componentes de interface acessíveis e personalizáveis, baseados em Radix UI.
*   **Ícones**: Lucide React para uma vasta coleção de ícones SVG.
*   **Roteamento**: React Router para navegação eficiente e gerenciamento de rotas no lado do cliente.
*   **Notificações**: Sonner para exibir toasts (notificações) elegantes e informativas.
*   **Gerenciamento de Estado**: `useState` e `useContext` do React para gerenciamento de estado local e global.
*   **Persistência de Dados**: `localStorage` para persistência de dados no lado do cliente. Supabase é uma integração opcional para persistência de dados em banco de dados.
*   **Servidor Local (Dev)**: Express e Multer para um servidor integrado de upload e listagem de áudios em ambiente de desenvolvimento.

## 📚 Regras de Uso de Bibliotecas

Para manter a consistência e a qualidade do código, siga estas diretrizes ao usar as bibliotecas:

*   **Componentes de UI**:
    *   Sempre utilize os componentes pré-construídos da `shadcn/ui` localizados em `src/components/ui/`.
    *   Se um componente específico não estiver disponível ou precisar de personalização significativa, crie um novo componente em `src/components/` e utilize as classes do Tailwind CSS para estilizá-lo. **Não modifique os arquivos originais da `shadcn/ui`**.
*   **Estilização**:
    *   Toda a estilização deve ser feita utilizando classes do Tailwind CSS.
    *   Evite estilos inline ou arquivos CSS separados, exceto para estilos globais (`src/index.css`) ou animações complexas que não podem ser totalmente expressas com Tailwind.
*   **Ícones**:
    *   Utilize exclusivamente os ícones fornecidos pela biblioteca `lucide-react`.
*   **Roteamento**:
    *   Gerencie todas as rotas da aplicação com `react-router-dom`.
    *   As rotas principais devem ser definidas em `src/App.tsx`.
*   **Gerenciamento de Estado**:
    *   Para o estado local de componentes, use `useState`.
    *   Para o estado compartilhado entre múltiplos componentes ou global, utilize o Context API do React (`useContext`), como exemplificado em `src/contexts/AuthContext.tsx`.
*   **Notificações**:
    *   Para exibir mensagens de feedback ao usuário (sucesso, erro, informação), utilize a biblioteca `sonner` (toasts).
*   **Persistência de Dados**:
    *   Para dados que precisam ser persistidos no lado do cliente (ex: configurações do admin, lista de áudios em modo local), utilize `localStorage`.
    *   Se o Supabase estiver configurado (`isSupabaseConfigured` em `src/integrations/supabase/client.ts` for `true`), utilize o cliente `supabase` para interagir com o banco de dados para dados persistentes no servidor.
*   **Reprodução de Áudio**:
    *   Utilize o elemento nativo `<audio>` do HTML5 para a reprodução de arquivos de áudio.
*   **Estrutura de Arquivos**:
    *   Novos componentes devem ser criados em `src/components/`.
    *   Novas páginas devem ser criadas em `src/pages/`.
    *   Funções utilitárias devem ser adicionadas em `src/utils/`.
    *   Hooks personalizados devem ser criados em `src/hooks/`.