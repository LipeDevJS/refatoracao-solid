class OrderItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }

  getSubtotal() {
    return this.product.price * this.quantity;
  }

  getWeight() {
    return this.product.weight * this.quantity;
  }
}

module.exports = OrderItem;
