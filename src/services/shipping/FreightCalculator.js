const DEFAULT_RATES = {
  sudeste: { base: 20, perKg: 4 },
  sul: { base: 28, perKg: 5 },
  "centro-oeste": { base: 35, perKg: 6 },
  nordeste: { base: 45, perKg: 7 },
  norte: { base: 60, perKg: 9 }
};
const FALLBACK_RATE = { base: 50, perKg: 8 };
const FREE_SHIPPING_COUPON = "FRETEGRATIS";

class FreightCalculator {
  constructor({
    rates = DEFAULT_RATES,
    fallbackRate = FALLBACK_RATE,
    freeShippingCoupon = FREE_SHIPPING_COUPON
  } = {}) {
    this.rates = rates;
    this.fallbackRate = fallbackRate;
    this.freeShippingCoupon = freeShippingCoupon;
  }

  calculate(order) {
    if (order.hasCoupon(this.freeShippingCoupon)) {
      return 0;
    }

    const rate = this.rates[order.getShippingRegion()] || this.fallbackRate;
    return rate.base + order.getTotalWeight() * rate.perKg;
  }
}

module.exports = FreightCalculator;
