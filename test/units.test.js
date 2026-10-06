const test = require("node:test");
const assert = require("node:assert/strict");
const DiscountCalculator = require("../src/services/pricing/DiscountCalculator");
const CustomerTypeDiscount = require("../src/services/pricing/discounts/CustomerTypeDiscount");
const CouponDiscount = require("../src/services/pricing/discounts/CouponDiscount");
const HighValueOrderDiscount = require("../src/services/pricing/discounts/HighValueOrderDiscount");
const FreightCalculator = require("../src/services/shipping/FreightCalculator");
const PaymentProcessor = require("../src/services/payment/PaymentProcessor");
const PixPayment = require("../src/services/payment/PixPayment");
const CreditCardPayment = require("../src/services/payment/CreditCardPayment");
const BoletoPayment = require("../src/services/payment/BoletoPayment");
const OrderValidator = require("../src/services/order/OrderValidator");
const InventoryService = require("../src/services/order/InventoryService");
const NotificationService = require("../src/services/NotificationService");
const { makeCustomer, makeRepo, makeOrder, item } = require("../tests-support/helpers");

test("descontos por tipo de cliente, cupom e valor alto", () => {
  const repo = makeRepo();
  const order = (type, coupon) => makeOrder({ customer: makeCustomer({ type }), items: [item(repo, "p2", 1)], coupon });
  assert.equal(new CustomerTypeDiscount().calculate(order("vip"), 1000), 80);
  assert.equal(new CustomerTypeDiscount().calculate(order("employee"), 1000), 150);
  assert.equal(new CustomerTypeDiscount().calculate(order("regular"), 1000), 0);
  assert.equal(new CouponDiscount().calculate(order("regular", "TECH10"), 1000), 100);
  assert.equal(new CouponDiscount().calculate(order("regular", "OUTRO"), 1000), 0);
  assert.equal(new HighValueOrderDiscount().calculate(order("regular"), 8000), 0);
  assert.equal(new HighValueOrderDiscount().calculate(order("regular"), 8000.01), 250);
});

test("DiscountCalculator soma qualquer política (OCP: nova regra sem alterar código)", () => {
  const repo = makeRepo();
  const order = makeOrder({ items: [item(repo, "p2", 1)] });
  const blackFriday = { calculate: (o, subtotal) => subtotal * 0.5 };
  const calc = new DiscountCalculator([new CustomerTypeDiscount(), blackFriday]);
  assert.equal(calc.calculate(order, 100), 50);
});

test("frete por região, peso, tarifa padrão e cupom de frete grátis", () => {
  const repo = makeRepo();
  const freight = new FreightCalculator();
  const orderIn = (region, coupon) =>
    makeOrder({ customer: makeCustomer({ region }), items: [item(repo, "p3", 1)], coupon }); // 5.4 kg
  assert.equal(freight.calculate(orderIn("sudeste")), 20 + 5.4 * 4);
  assert.equal(freight.calculate(orderIn("sul")), 28 + 5.4 * 5);
  assert.equal(freight.calculate(orderIn("centro-oeste")), 35 + 5.4 * 6);
  assert.equal(freight.calculate(orderIn("nordeste")), 45 + 5.4 * 7);
  assert.equal(freight.calculate(orderIn("norte")), 60 + 5.4 * 9);
  assert.equal(freight.calculate(orderIn("marte")), 50 + 5.4 * 8);
  assert.equal(freight.calculate(orderIn("norte", "FRETEGRATIS")), 0);
});

test("meios de pagamento retornam status, taxa e desconto", () => {
  const repo = makeRepo();
  const processor = new PaymentProcessor({ pix: new PixPayment(), credit_card: new CreditCardPayment(), boleto: new BoletoPayment() });
  const order = (payment, installments = 1) => makeOrder({ items: [item(repo, "p2", 1)], payment, installments });
  assert.deepEqual(processor.process(order("pix"), 1000), { status: "approved", fee: 0, discount: 30 });
  assert.deepEqual(processor.process(order("credit_card", 1), 1000), { status: "approved", fee: 0, discount: 0 });
  assert.deepEqual(processor.process(order("credit_card", 2), 1000), { status: "approved", fee: 25, discount: 0 });
  assert.deepEqual(processor.process(order("boleto"), 1000), { status: "waiting_payment", fee: 0, discount: 0 });
  assert.throws(() => processor.process(order("cheque"), 1000), /Forma de pagamento invalida/);
});

test("novo meio de pagamento entra sem alterar PaymentProcessor (OCP)", () => {
  const repo = makeRepo();
  const processor = new PaymentProcessor({ voucher: { process: () => ({ status: "approved", fee: 0, discount: 5 }) } });
  const order = makeOrder({ items: [item(repo, "p2", 1)], payment: "voucher" });
  assert.equal(processor.process(order, 100).discount, 5);
});

test("OrderValidator isolado, com repositório falso (DIP)", () => {
  const validator = new OrderValidator({ findById: () => ({ id: "x", name: "Falso", stock: 1 }) });
  const repo = makeRepo();
  assert.throws(() => validator.validate(makeOrder({ items: [item(repo, "p1", 2)] })), /Estoque insuficiente para Falso/);
});

test("InventoryService baixa o estoque dos itens", () => {
  const repo = makeRepo();
  new InventoryService(repo).reserve([item(repo, "p1", 3), item(repo, "p2", 5)]);
  assert.equal(repo.findById("p1").stock, 5);
  assert.equal(repo.findById("p2").stock, 25);
});

test("NotificationService usa o canal injetado", () => {
  const sent = [];
  new NotificationService({ send: (to, message) => sent.push({ to, message }) })
    .sendOrderConfirmation(makeCustomer(), "o9", 10);
  assert.equal(sent[0].to, "cliente@example.com");
  assert.match(sent[0].message, /pedido o9/);
});

test("Demeter: Customer e Order expõem região/cidade sem navegar em address", () => {
  const customer = makeCustomer({ region: "sul" });
  assert.equal(customer.getRegion(), "sul");
  assert.equal(customer.getCity(), "Prudente");
  assert.equal(makeOrder({ customer, items: [] }).getShippingRegion(), "sul");
});
