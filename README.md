# TechStore – Refatoração SOLID

Sistema de pedidos da TechStore refatorado aplicando SOLID, composição e Princípio de Demeter,
**sem alterar o comportamento** do sistema original.

## Como executar

Requisitos: Node.js 20 ou superior.

```bash
npm start      # executa o exemplo do src/index.js
npm test       # executa os testes automatizados (node:test, sem dependências)
```

## Estrutura

```
src/
├── index.js                      # exemplo de uso
├── container.js                  # Composition Root (monta o grafo de objetos)
├── domain/                       # Address, Customer, Order, OrderItem, Product
├── repositories/                 # ProductRepository, OrderRepository
├── utils/Logger.js
└── services/
    ├── OrderService.js           # apenas orquestra o fluxo
    ├── NotificationService.js    # + notification/ConsoleEmailSender.js
    ├── order/                    # OrderValidator, InventoryService, OrderSummaryFactory, OrderSummaryPrinter
    ├── pricing/                  # DiscountCalculator + discounts/ (políticas de desconto)
    ├── shipping/                 # FreightCalculator (tabela de tarifas por região)
    └── payment/                  # PaymentProcessor + Pix / CreditCard / Boleto
test/                             # testes: caracterização, unitários e orquestração
tests-support/helpers.js          # fábricas usadas pelos testes
```

## Nota sobre o repositório original

O `OrderService.js` original importa `./NotificationService`, arquivo que **não existe** no repositório
base (o projeto não executa). Ele foi criado respeitando o contrato usado pelo original:
`sendOrderConfirmation(customer, orderId, total)`.

Veja o relatório técnico entregue junto com a atividade para o diagnóstico completo.
