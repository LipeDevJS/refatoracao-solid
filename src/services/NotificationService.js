const ConsoleEmailSender = require("./notification/ConsoleEmailSender");

class NotificationService {
  constructor(sender = new ConsoleEmailSender()) {
    this.sender = sender;
  }

  sendOrderConfirmation(customer, orderId, total) {
    this.sender.send(
      customer.email,
      `Enviando confirmacao do pedido ${orderId} para {to} (total: R$ ${total.toFixed(2)}).`
    );
  }
}

module.exports = NotificationService;
