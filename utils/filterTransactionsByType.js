

const filterTransactionsByType = (transactions, type) => {
    
    let typeTransaction = type;

    switch (type) {
        case 'income':
           typeTransaction = "i"
            break;
        case 'expenses':
            typeTransaction = "e"
            break;
        case 'loans':
            typeTransaction = "l"
            break;
    }

    if (type === 'all') {
      return transactions;
    }
    return transactions.filter((transaction) => transaction.type === typeTransaction);
  };

export default filterTransactionsByType;