// AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

const getNextId = async () => {
    try {
      // Load existing transactions from AsyncStorage
      const existingTransactions = await AsyncStorage.getItem('transactions');
      let transactions = [];
  
      if (existingTransactions !== null) {
        // Parse stored transactions into an object array
        transactions = JSON.parse(existingTransactions);
      }
  
      if (transactions.length === 0) {
        // No transactions yet — next id is 1
        return 1;
      } else {
        // Use last transaction id + 1
        const lastTransaction = transactions[transactions.length - 1];
        const lastId = lastTransaction.id;
        const nextId = lastId + 1;
        return nextId;
      }
    } catch (error) {
      console.log('Error getting next id:', error);
      return null;
    }
  };

  export default getNextId;