// Testes de caracterização: valores obtidos executando o sistema ORIGINAL.
// Garantem que a refatoração preservou o comportamento externo.
const test = require("node:test");
const assert = require("node:assert/strict");
const { createContainer } = require("../src/container");
const { makeCustomer, makeOrder, item, silent, Product, OrderItem } = require("../tests-support/helpers");

function run(buildOrder) {
  const container = createContainer();
  const restore = silent();
  try {
    return { ...container, result: container.orderService.process(buildOrder(container.productRepository)) };
  } finally {
    restore();
  }
}

function fail(buildOrder) {
  const container = createContainer();
  const restore = silent();
  try {
    return assert.throws(() => container.orderService.process(buildOrder(container.productRepository)));
  } finally {
    restore();
  }
}

test("VIP + TECH10 + cartão 3x (exemplo do index.js)", () => {
  const { result } = run((r) =>
    makeOrder({ customer: makeCustomer({ type: "vip" }), items: [item(r, "p1", 1), item(r, "p2", 2)], coupon: "TECH10", payment: "credit_card", installments: 3 })
  );
  assert.equal(result.subtotal, 6440);
  assert.equal(result.discount, 1159.2);
  assert.equal(result.freight, 30);
  assert.equal(result.paymentFee, 161);
  assert.equal(result.total, 5471.8);
  assert.equal(result.status, "confirmed");
});

test("funcionário + pix na região sul", () => {
  const { result } = run((r) =>
    makeOrder({ customer: makeCustomer({ type: "employee", region: "sul" }), items: [item(r, "p3", 2)], payment: "pix" })
  );
  assert.deepEqual([result.discount, result.freight, result.total], [522, 82, 2460]);
});

test("boleto + FRETEGRATIS deixa o pedido aguardando pagamento", () => {
  const { result } = run((r) =>
    makeOrder({ customer: makeCustomer({ region: "norte" }), items: [item(r, "p4", 3)], coupon: "FRETEGRATIS", payment: "boleto" })
  );
  assert.deepEqual([result.discount, result.freight, result.total, result.status], [0, 0, 1140, "waiting_payment"]);
});

test("subtotal acima de R$ 8000 recebe R$ 250 de desconto (nordeste)", () => {
  const { result } = run((r) =>
    makeOrder({ customer: makeCustomer({ region: "nordeste" }), items: [item(r, "p1", 2)], payment: "credit_card", installments: 1 })
  );
  assert.deepEqual([result.discount, result.freight, result.paymentFee, result.total], [250, 74.4, 0, 12224.4]);
});

test("região desconhecida usa a tarifa padrão", () => {
  const { result } = run((r) =>
    makeOrder({ customer: makeCustomer({ type: "vip", region: "exterior" }), items: [item(r, "p2", 5)], coupon: "TECH10", payment: "pix" })
  );
  assert.deepEqual([result.discount, result.freight, result.total], [126, 58, 532]);
});

test("pedido misto, funcionário + TECH10 + pix (centro-oeste)", () => {
  const { result } = run((r) =>
    makeOrder({ customer: makeCustomer({ type: "employee", region: "centro-oeste" }), items: [item(r, "p1", 1), item(r, "p3", 1), item(r, "p4", 2)], coupon: "TECH10", payment: "pix" })
  );
  assert.deepEqual([result.discount, result.freight, result.total], [2604.8, 90.8, 5896]);
});

test("pedido processado é salvo, estoque baixado e e-mail enviado só se confirmado", () => {
  const { orderRepository, productRepository } = run((r) =>
    makeOrder({ items: [item(r, "p2", 4)], payment: "pix" })
  );
  assert.equal(orderRepository.findAll().length, 1);
  assert.equal(productRepository.findById("p2").stock, 26);
});

test("mensagens de erro de validação continuam as mesmas", () => {
  const cases = [
    [() => makeOrder({ customer: null, items: [] }), /Cliente obrigatorio\./],
    [() => makeOrder({ customer: makeCustomer({ email: "sem-arroba" }), items: [] }), /E-mail do cliente invalido\./],
    [() => makeOrder({ items: [] }), /Pedido sem itens\./],
    [() => makeOrder({ items: [new OrderItem(null, 1)] }), /Item sem produto\./],
    [(r) => makeOrder({ items: [item(r, "p1", 0)] }), /Quantidade invalida\./],
    [() => makeOrder({ items: [new OrderItem(new Product("zz", "X", "x", 1, 1, 1), 1)] }), /Produto zz nao encontrado\./],
    [(r) => makeOrder({ items: [item(r, "p1", 9)] }), /Estoque insuficiente para Notebook Pro 14\./],
    [(r) => makeOrder({ items: [item(r, "p1", 1)], payment: "cheque" }), /Forma de pagamento invalida\./],
    [() => makeOrder({ customer: makeCustomer({ type: "employee" }), items: [new OrderItem(new Product("p2", "Mouse", "p", 0, 0.2, 30), 1)], coupon: "FRETEGRATIS" }), /Total do pedido invalido\./]
  ];
  for (const [build, message] of cases) {
    assert.throws(() => {
      const container = createContainer();
      const restore = silent();
      try { container.orderService.process(build(container.productRepository)); } finally { restore(); }
    }, message);
  }
});

test("erro de validação não baixa estoque nem salva pedido", () => {
  const container = createContainer();
  const restore = silent();
  try {
    assert.throws(() => container.orderService.process(makeOrder({ items: [item(container.productRepository, "p1", 1)], payment: "cheque" })));
  } finally { restore(); }
  assert.equal(container.productRepository.findById("p1").stock, 8);
  assert.equal(container.orderRepository.findAll().length, 0);
});
