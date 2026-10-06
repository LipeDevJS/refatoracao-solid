const DEFAULT_RATES = { vip: 0.08, employee: 0.15 };

class CustomerTypeDiscount {
  constructor(rates = DEFAULT_RATES) {
    this.rates = rates;
  }

  calculate(order, subtotal) {
    const rate = this.rates[order.customer.type];
    return rate ? subtotal * rate : 0;
  }
}

module.exports = CustomerTypeDiscount;
