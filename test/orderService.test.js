// OrderService testado com dublês de todos os colaboradores: só a orquestração é verificada.
const test = require("node:test");
const assert = require("node:assert/strict");
const OrderService = require("../src/services/OrderService");
const { makeRepo, makeOrder, item } = require("../tests-support/helpers");

function build({ payment = { status: "approved", fee: 0, discount: 0 }, validate = () => {} } = {}) {
  const calls = [];
  const saved = [];
  const service = new OrderService({
    validator: { validate: () => { calls.push("validate"); validate(); } },
    discountCalculator: { calculate: () => { calls.push("discount"); return 10; } },
    freightCalculator: { calculate: () => { calls.push("freight"); return 20; } },
    paymentProcessor: { process: () => { calls.push("payment"); return payment; } },
    inventoryService: { reserve: () => calls.push("inventory") },
    orderRepository: { save: (s) => { calls.push("save"); saved.push(s); } },
    notificationService: { sendOrderConfirmation: () => calls.push("notify") },
    summaryFactory: new (require("../src/services/order/OrderSummaryFactory"))(),
    summaryPrinter: { print: () => calls.push("print") },
    logger: { info: () => {}, warn: () => calls.push("warn") }
  });
  return { service, calls, saved };
}

test("executa o fluxo na ordem correta e notifica quando aprovado", () => {
  const repo = makeRepo();
  const { service, calls, saved } = build();
  const summary = service.process(makeOrder({ items: [item(repo, "p2", 1)] })); // subtotal 120
  assert.deepEqual(calls, ["validate", "discount", "freight", "payment", "inventory", "save", "notify", "print"]);
  assert.equal(summary.total, 130); // 120 - 10 + 20
  assert.equal(saved.length, 1);
});

test("pagamento pendente não notifica, apenas registra aviso", () => {
  const repo = makeRepo();
  const { service, calls } = build({ payment: { status: "waiting_payment", fee: 0, discount: 0 } });
  const summary = service.process(makeOrder({ items: [item(repo, "p2", 1)] }));
  assert.equal(summary.status, "waiting_payment");
  assert.ok(calls.includes("warn"));
  assert.ok(!calls.includes("notify"));
});

test("falha na validação interrompe o fluxo antes de qualquer efeito colateral", () => {
  const repo = makeRepo();
  const { service, calls } = build({ validate: () => { throw new Error("inválido"); } });
  assert.throws(() => service.process(makeOrder({ items: [item(repo, "p2", 1)] })), /inválido/);
  assert.deepEqual(calls, ["validate"]);
});
