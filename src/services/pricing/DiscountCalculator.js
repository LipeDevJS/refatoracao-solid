// Composição: soma o resultado de qualquer lista de políticas de desconto.
// Para criar uma nova regra basta incluir outra política na lista (OCP).
class DiscountCalculator {
  constructor(policies) {
    this.policies = policies;
  }

  calculate(order, subtotal) {
    return this.policies.reduce(
      (total, policy) => total + policy.calculate(order, subtotal),
      0
    );
  }
}

module.exports = DiscountCalculator;
