# Status do Projeto — Atualizado

## ✅ CONCLUÍDO

### Segurança & Integridade
- [x] Políticas RLS convertidas de RESTRICTIVE para PERMISSIVE em todas as tabelas
- [x] Trigger `on_auth_user_created` criado para popular `profiles` automaticamente
- [x] Função transacional `create_order()` com validação de estoque atômica
- [x] Função `cancel_order()` com devolução de estoque e motivo obrigatório
- [x] Coluna `user_id` em orders, pedidos vinculados ao usuário autenticado

### Funcionalidade
- [x] Carrinho (AppCarrinho) valida estoque e limita incremento
- [x] AppConfig sincroniza com tabela `profiles` via upsert
- [x] Dashboard exclui pedidos cancelados do faturamento
- [x] Dashboard com trends reais (comparação com período anterior)
- [x] Cupons integrados no checkout
- [x] Recuperação de senha na tela de login
- [x] AdminSettings persiste no banco (tabela `settings`)
- [x] Nome do admin resolvido no tracking de pedidos

### Navegação & UX
- [x] Links da Navbar apontam diretamente para `/app/produtos`, `/app/carrinho`, `/app/pedidos`
- [x] HeroSection aponta para `/app/produtos`
- [x] Campanha atualizada para 2026
- [x] Sistema de toast padronizado (sonner em todo o projeto)
- [x] FAQ atualizado para modelo de retirada presencial
- [x] WhatsApp corrigido (número real)

## ⏳ PENDENTE (baixa prioridade)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 1 | Corrigir warnings de forwardRef | ProductCard e AppProdutos — não é crítico |
| 2 | Paginação nos pedidos admin | Evitar limite de 1000 rows do Supabase |
| 3 | Proteção contra double-submit | Idempotency key no checkout |
| 4 | Notificação de pedido pronto | Edge function para email automático |
| 5 | Leaked password protection | Configuração de segurança no auth |
