const DEFAULT_COUPONS = { TECH10: 0.1 };

class CouponDiscount {
  constructor(coupons = DEFAULT_COUPONS) {
    this.coupons = coupons;
  }

  calculate(order, subtotal) {
    const rate = this.coupons[order.couponCode];
    return rate ? subtotal * rate : 0;
  }
}

module.exports = CouponDiscount;
