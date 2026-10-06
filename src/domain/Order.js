class Order {
  constructor(id, customer, items, couponCode, paymentMethod, installments) {
    this.id = id;
    this.customer = customer;
    this.items = items;
    this.couponCode = couponCode;
    this.paymentMethod = paymentMethod;
    this.installments = installments;
    this.status = "created";
    this.createdAt = new Date();
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  getTotalWeight() {
    return this.items.reduce((total, item) => total + item.getWeight(), 0);
  }

  // Demeter: o pedido expõe o que os colaboradores precisam.
  getShippingRegion() {
    return this.customer.getRegion();
  }

  hasCoupon(code) {
    return this.couponCode === code;
  }

  confirm() {
    this.status = "confirmed";
  }

  awaitPayment() {
    this.status = "waiting_payment";
  }

  isConfirmed() {
    return this.status === "confirmed";
  }
}

module.exports = Order;
