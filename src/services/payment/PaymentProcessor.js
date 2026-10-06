// Escolhe a estratégia de pagamento pelo nome. Novos meios de pagamento são
// adicionados registrando uma nova classe, sem alterar este código (OCP).
class PaymentProcessor {
  constructor(methods) {
    this.methods = methods;
  }

  process(order, subtotal) {
    const method = this.methods[order.paymentMethod];

    if (!method) {
      throw new Error("Forma de pagamento invalida.");
    }

    return method.process(order, subtotal);
  }
}

module.exports = PaymentProcessor;
