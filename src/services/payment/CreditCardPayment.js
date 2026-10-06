class CreditCardPayment {
  constructor(installmentFeeRate = 0.025) {
    this.installmentFeeRate = installmentFeeRate;
  }

  process(order, subtotal) {
    const fee = order.installments > 1 ? subtotal * this.installmentFeeRate : 0;
    return { status: "approved", fee, discount: 0 };
  }
}

module.exports = CreditCardPayment;
