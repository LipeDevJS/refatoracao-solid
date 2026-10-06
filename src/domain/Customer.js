class Customer {
  constructor(id, name, email, phone, type, address) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.type = type;
    this.address = address;
  }

  hasValidEmail() {
    return Boolean(this.email) && this.email.includes("@");
  }

  // Princípio de Demeter: quem precisa da região/cidade/estado pergunta ao
  // cliente, sem "navegar" por customer.address.region.
  getRegion() {
    return this.address.region;
  }

  getCity() {
    return this.address.city;
  }

  getState() {
    return this.address.state;
  }
}

module.exports = Customer;
