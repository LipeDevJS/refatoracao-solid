class PixPayment {
  constructor(discountRate = 0.03) {
    this.discountRate = discountRate;
  }

  process(order, subtotal) {
    return { status: "approved", fee: 0, discount: subtotal * this.discountRate };
  }
}

module.exports = PixPayment;
