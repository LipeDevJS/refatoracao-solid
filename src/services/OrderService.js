// OrderService agora só ORQUESTRA o fluxo. Cada passo é delegado a um
// colaborador injetado (DIP), o que permite trocar/mocar qualquer parte.
class OrderService {
  constructor({
    validator,
    discountCalculator,
    freightCalculator,
    paymentProcessor,
    inventoryService,
    orderRepository,
    notificationService,
    summaryFactory,
    summaryPrinter,
    logger
  }) {
    this.validator = validator;
    this.discountCalculator = discountCalculator;
    this.freightCalculator = freightCalculator;
    this.paymentProcessor = paymentProcessor;
    this.inventoryService = inventoryService;
    this.orderRepository = orderRepository;
    this.notificationService = notificationService;
    this.summaryFactory = summaryFactory;
    this.summaryPrinter = summaryPrinter;
    this.logger = logger;
  }

  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.id}.`);

    this.validator.validate(order);

    const subtotal = order.getSubtotal();
    const policyDiscount = this.discountCalculator.calculate(order, subtotal);
    const freight = this.freightCalculator.calculate(order);
    const payment = this.paymentProcessor.process(order, subtotal);

    const discount = policyDiscount + payment.discount;
    const paymentFee = payment.fee;
    const total = Number((subtotal - discount + freight + paymentFee).toFixed(2));

    if (total <= 0) {
      throw new Error("Total do pedido invalido.");
    }

    this.inventoryService.reserve(order.items);

    if (payment.status === "approved") {
      order.confirm();
    } else {
      order.awaitPayment();
    }

    const amounts = { subtotal, discount, freight, paymentFee, total };
    const orderSummary = this.summaryFactory.create(order, amounts);

    this.orderRepository.save(orderSummary);
    this.notifyCustomer(order, total);
    this.summaryPrinter.print(order, amounts);

    return orderSummary;
  }

  notifyCustomer(order, total) {
    if (order.isConfirmed()) {
      this.notificationService.sendOrderConfirmation(order.customer, order.id, total);
    } else {
      this.logger.warn(`Pedido ${order.id} aguardando pagamento.`);
    }
  }
}

module.exports = OrderService;
