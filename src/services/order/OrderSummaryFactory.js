const round = (value) => Number(value.toFixed(2));

class OrderSummaryFactory {
  create(order, { subtotal, discount, freight, paymentFee, total }) {
    const { customer } = order;

    return {
      id: order.id,
      customerName: customer.name,
      customerEmail: customer.email,
      city: customer.getCity(),
      state: customer.getState(),
      items: order.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        subtotal: item.getSubtotal()
      })),
      subtotal,
      discount: round(discount),
      freight: round(freight),
      paymentFee: round(paymentFee),
      total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt
    };
  }
}

module.exports = OrderSummaryFactory;
