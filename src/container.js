const ProductRepository = require("./repositories/ProductRepository");
const OrderRepository = require("./repositories/OrderRepository");
const Logger = require("./utils/Logger");
const OrderService = require("./services/OrderService");
const NotificationService = require("./services/NotificationService");
const OrderValidator = require("./services/order/OrderValidator");
const InventoryService = require("./services/order/InventoryService");
const OrderSummaryFactory = require("./services/order/OrderSummaryFactory");
const OrderSummaryPrinter = require("./services/order/OrderSummaryPrinter");
const DiscountCalculator = require("./services/pricing/DiscountCalculator");
const CustomerTypeDiscount = require("./services/pricing/discounts/CustomerTypeDiscount");
const CouponDiscount = require("./services/pricing/discounts/CouponDiscount");
const HighValueOrderDiscount = require("./services/pricing/discounts/HighValueOrderDiscount");
const FreightCalculator = require("./services/shipping/FreightCalculator");
const PaymentProcessor = require("./services/payment/PaymentProcessor");
const PixPayment = require("./services/payment/PixPayment");
const CreditCardPayment = require("./services/payment/CreditCardPayment");
const BoletoPayment = require("./services/payment/BoletoPayment");

// Composition Root: único lugar que conhece as classes concretas e monta o grafo.
function createContainer(overrides = {}) {
  const productRepository = overrides.productRepository || new ProductRepository();
  const orderRepository = overrides.orderRepository || new OrderRepository();
  const logger = overrides.logger || new Logger();

  const orderService = new OrderService({
    validator: new OrderValidator(productRepository),
    discountCalculator: new DiscountCalculator([
      new CustomerTypeDiscount(),
      new CouponDiscount(),
      new HighValueOrderDiscount()
    ]),
    freightCalculator: new FreightCalculator(),
    paymentProcessor: new PaymentProcessor({
      pix: new PixPayment(),
      credit_card: new CreditCardPayment(),
      boleto: new BoletoPayment()
    }),
    inventoryService: new InventoryService(productRepository),
    orderRepository,
    notificationService: overrides.notificationService || new NotificationService(),
    summaryFactory: new OrderSummaryFactory(),
    summaryPrinter: new OrderSummaryPrinter(),
    logger
  });

  return { orderService, productRepository, orderRepository, logger };
}

module.exports = { createContainer };
