// AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

const getNextId = async () => {
    try {
      // Obtén las transacciones existentes de AsyncStorage
      const existingTransactions = await AsyncStorage.getItem('transactions');
      let transactions = [];
  
      if (existingTransactions !== null) {
        // Si hay transacciones existentes, conviértelas en un array de objetos
        transactions = JSON.parse(existingTransactions);
      }
  
      if (transactions.length === 0) {
        // Si no hay transacciones, devuelve 1 como el próximo id
        return 1;
      } else {
        // Si hay transacciones, obtén el último id y calcula el siguiente id
        const lastTransaction = transactions[transactions.length - 1];
        const lastId = lastTransaction.id;
        const nextId = lastId + 1;
        return nextId;
      }
    } catch (error) {
      console.log('Error al obtener el próximo id:', error);
      return null;
    }
  };

  export default getNextId;