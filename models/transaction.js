class Transaction {
    constructor(id, type, amount, account, date, category, description) {
      this.id = id;
      this.type = type;
      this.amount = amount;
      this.account = account;
      this.date = date;
      this.category = category;
      this.description = description;
    }
  }
  
  export default Transaction;