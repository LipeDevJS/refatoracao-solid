class OrderSummaryPrinter {
  constructor(output = console) {
    this.output = output;
  }

  print(order, { subtotal, discount, freight, paymentFee, total }) {
    const { customer } = order;
    const money = (value) => `R$ ${value.toFixed(2)}`;

    this.output.log("Resumo do pedido");
    this.output.log(`Cliente: ${customer.name}`);
    this.output.log(`Cidade: ${customer.getCity()}/${customer.getState()}`);
    this.output.log(`Itens: ${order.getTotalItems()}`);
    this.output.log(`Subtotal: ${money(subtotal)}`);
    this.output.log(`Desconto: ${money(discount)}`);
    this.output.log(`Frete: ${money(freight)}`);
    this.output.log(`Taxas: ${money(paymentFee)}`);
    this.output.log(`Total: ${money(total)}`);
  }
}

module.exports = OrderSummaryPrinter;
