class InventoryService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  reserve(items) {
    for (const item of items) {
      this.productRepository.updateStock(item.product.id, item.quantity);
    }
  }
}

module.exports = InventoryService;
