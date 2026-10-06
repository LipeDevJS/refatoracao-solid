const Address = require("../src/domain/Address");
const Customer = require("../src/domain/Customer");
const Order = require("../src/domain/Order");
const OrderItem = require("../src/domain/OrderItem");
const Product = require("../src/domain/Product");
const ProductRepository = require("../src/repositories/ProductRepository");

const makeCustomer = ({ type = "regular", region = "sudeste", email = "cliente@example.com" } = {}) =>
  new Customer("c1", "Fulano", email, "18999990000", type, new Address("Rua A", "1", "Prudente", "SP", "19000-000", region));

const makeRepo = () => new ProductRepository();

const makeOrder = ({ customer = makeCustomer(), items, coupon = null, payment = "pix", installments = 1, id = "o1" } = {}) =>
  new Order(id, customer, items, coupon, payment, installments);

const item = (repo, productId, quantity) => new OrderItem(repo.findById(productId), quantity);

const silent = () => {
  const original = console.log;
  console.log = () => {};
  return () => { console.log = original; };
};

module.exports = { makeCustomer, makeRepo, makeOrder, item, silent, Product, OrderItem };
