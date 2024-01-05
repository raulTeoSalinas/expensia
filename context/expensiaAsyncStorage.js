// AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
// Models
import Transaction from "../models/transaction";


const addTransactionAsync = async (id, type, amount, account, date, category, description) => {
    try {
        //Esperamos async de getNextId
        if (id !== null) {
            //Creamos la transacción
            const transaction = new Transaction(id, type, amount, account, date, category, description);

            // Obtén las transacciones existentes de AsyncStorage
            let transactionsAsyn = [];
            const existingTransactions = await AsyncStorage.getItem('transactions');
            if (existingTransactions !== null) {
                // Si hay transacciones existentes, conviértelas en un array de objetos
                transactionsAsyn = JSON.parse(existingTransactions);
            }
            // Agrega la nueva transacción al array
            transactionsAsyn.push(transaction);

            // Guarda el array de transacciones actualizado en AsyncStorage
            await AsyncStorage.setItem('transactions', JSON.stringify(transactionsAsyn));
        }
    } catch (e) {
        console.log('No se pudo acceder a AsyncStorage')
    }
}

const editTransactionAsync = async (id, type, amount, account, date, category, description) => {

    try {

        const transaction = new Transaction(id, type, amount, account, date, category, description);
        // Obtén las transacciones existentes de AsyncStorage
        let transactionsAsyn = [];
        const existingTransactions = await AsyncStorage.getItem('transactions');

        if (existingTransactions !== null) {
            // Si hay transacciones existentes, conviértelas en un array de objetos
            transactionsAsyn = JSON.parse(existingTransactions);
        }
        // Encuentra la transacción que deseas editar en el array
        const transactionIndex = transactionsAsyn.findIndex(tran => tran.id === id);

        if (transactionIndex !== -1) {
            // Realiza las modificaciones en la transacción existente
            transactionsAsyn[transactionIndex] = transaction;

            // Guarda el array de transacciones actualizado en AsyncStorage
            await AsyncStorage.setItem('transactions', JSON.stringify(transactionsAsyn));
        } else {
            console.log('No se encontró la transacción a editar');
        }
        
    } catch (e) {
        console.log("No se pudo acceder al id correspondiente")
    }
}

const deleteTransactionAsync = async (id) => {
    try {
      // Obtén las transacciones existentes de AsyncStorage
      const existingTransactions = await AsyncStorage.getItem('transactions');
      let transactionsAsyn = [];
  
      if (existingTransactions !== null) {
        // Si hay transacciones existentes, conviértelas en un array de objetos
        transactionsAsyn = JSON.parse(existingTransactions);
      }
  
      // Encuentra el índice de la transacción que se desea eliminar
      const transactionIndex = transactionsAsyn.findIndex((tran) => tran.id === id);
  
      if (transactionIndex !== -1) {
        // Elimina la transacción del array
        transactionsAsyn.splice(transactionIndex, 1);
  
        // Guarda el array de transacciones actualizado en AsyncStorage
        await AsyncStorage.setItem('transactions', JSON.stringify(transactionsAsyn));
      } else {
        console.log('No se encontró la transacción a eliminar');
      }
    } catch (error) {
      console.log('Error al eliminar la transacción:', error);
    }
  };


  const checkUserExists = async (setUserExist) => {
    try {
      const existingUser = await AsyncStorage.getItem('user');
      setUserExist(existingUser !== null);
    } catch (error) {
      console.log('Error al verificar el objeto de usuario:', error);
    }
  };

  const createUserAsync = async (name, accounts, language) => {
    try {
      const user = {
        name: name,
        accounts: accounts,
        privacy: false,
        language: language
      };
      
      // Guarda el objeto de usuario en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.log('Error al crear el usuario:', error);
    }
  };

  const addOrRestAmountAsync = async (amount, type, account) => {
    try {
      // Obtener el objeto "user" almacenado en AsyncStorage
      const user = await AsyncStorage.getItem('user');
      
      if (user) {
        // Convertir el objeto "user" a un objeto JavaScript
        const prevUser = JSON.parse(user);
  
        // Crear una copia del arreglo de cuentas
        const updatedAccounts = prevUser.accounts.map(prevAccount => {
          if (prevAccount.id === account.id) {
            if (type === 'i') {
              return {
                ...prevAccount,
                amount: parseFloat(prevAccount.amount) + parseFloat(amount)
              };
            } else {
              return {
                ...prevAccount,
                amount: parseFloat(prevAccount.amount) - parseFloat(amount)
              };
            }
          }
          return prevAccount;
        });
  
        // Actualizar el objeto "user" con el arreglo de cuentas actualizado
        const updatedUser = {
          ...prevUser,
          accounts: updatedAccounts
        };
  
        // Guardar el objeto "user" actualizado en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  
        // La operación se completó con éxito
        console.log('La cantidad se ha sumado o restado con éxito.');
      } else {
        // No se encontró el objeto "user" en AsyncStorage
        console.log('No se encontró el objeto "user" en AsyncStorage.');
      }
    } catch (error) {
      // Ocurrió un error durante la operación
      console.error('Error al sumar o restar la cantidad:', error);
    }
  };

  const editAccountAsync = async (id, name, icon) => {
    try {
      // Obtener el objeto "user" almacenado en AsyncStorage
      const user = await AsyncStorage.getItem('user');
      
      if (user) {
        // Convertir el objeto "user" a un objeto JavaScript
        const prevUser = JSON.parse(user);
  
        const updatedAccounts = prevUser.accounts.map(prevAccount => {
          if (prevAccount.id === id) {
            return {
              ...prevAccount,
              name: name,
              icon: icon
            };
          }
          return prevAccount;
        });
  
        // Actualizar el objeto "user" con el arreglo de cuentas actualizado
        const updatedUser = {
          ...prevUser,
          accounts: updatedAccounts
        };
  
        // Guardar el objeto "user" actualizado en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  
        // La cuenta se ha editado con éxito
        console.log('La cuenta se ha editado con éxito.');
      } else {
        // No se encontró el objeto "user" en AsyncStorage
        console.log('No se encontró el objeto "user" en AsyncStorage.');
      }
    } catch (error) {
      // Ocurrió un error durante la operación
      console.error('Error al editar la cuenta:', error);
    }
  };

  
const addAccountAsync = async (name, icon) => {
  try {
    // Obtener el objeto "user" almacenado en AsyncStorage
    const user = await AsyncStorage.getItem('user');

    if (user) {
      // Convertir el objeto "user" a un objeto JavaScript
      const prevUser = JSON.parse(user);

      const newId = prevUser.accounts.length === 0 ? 1 : Math.max(...prevUser.accounts.map(account => account.id)) + 1;

      const newAccount = {
        id: newId,
        name: name,
        icon: icon,
        amount: 0
      };

      const updatedAccounts = [...prevUser.accounts, newAccount];

      // Actualizar el objeto "user" con el arreglo de cuentas actualizado
      const updatedUser = {
        ...prevUser,
        accounts: updatedAccounts
      };

      // Guardar el objeto "user" actualizado en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // La cuenta se ha agregado con éxito
      console.log('La cuenta se ha agregado con éxito.');
    } else {
      // No se encontró el objeto "user" en AsyncStorage
      console.log('No se encontró el objeto "user" en AsyncStorage.');
    }
  } catch (error) {
    // Ocurrió un error durante la operación
    console.error('Error al agregar la cuenta:', error);
  }
}

const deleteAccountAsync = async (id) => {
  try {
    // Obtener el objeto "user" almacenado en AsyncStorage
    const user = await AsyncStorage.getItem('user');

    if (user) {
      // Convertir el objeto "user" a un objeto JavaScript
      const prevUser = JSON.parse(user);

      const updatedAccounts = prevUser.accounts.filter(prevAccount => prevAccount.id !== id);

      // Actualizar el objeto "user" con el arreglo de cuentas actualizado
      const updatedUser = {
        ...prevUser,
        accounts: updatedAccounts
      };

      // Guardar el objeto "user" actualizado en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // La cuenta se ha eliminado con éxito
      console.log('La cuenta se ha eliminado con éxito.');
    } else {
      // No se encontró el objeto "user" en AsyncStorage
      console.log('No se encontró el objeto "user" en AsyncStorage.');
    }
  } catch (error) {
    // Ocurrió un error durante la operación
    console.error('Error al eliminar la cuenta:', error);
  }
};
  
const togglePrivacyAsyncStorage = async () => {
  try {
    const userFromStorage = await AsyncStorage.getItem('user');
    if (userFromStorage) {
      const user = JSON.parse(userFromStorage);
      const updatedUser = {
        ...user,
        privacy: !user.privacy
      };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  } catch (error) {
    console.error('Error al cambiar la privacidad en AsyncStorage:', error);
  }
};

const editUserLanguageAsync = async (language) => {
  try {
    // Obtener el objeto "user" almacenado en AsyncStorage
    const userJSON = await AsyncStorage.getItem('user');

    if (userJSON) {
      // Convertir el objeto "user" a un objeto JavaScript
      const user = JSON.parse(userJSON);

      // Actualizar el lenguaje del objeto "user"
      user.language = language;

      // Guardar el objeto "user" actualizado en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // El lenguaje del usuario se ha actualizado con éxito
      console.log('El lenguaje del usuario se ha actualizado con éxito.');
    } else {
      // No se encontró el objeto "user" en AsyncStorage
      console.log('No se encontró el objeto "user" en AsyncStorage.');
    }
  } catch (error) {
    // Ocurrió un error durante la operación
    console.error('Error al editar el lenguaje del usuario:', error);
  }
};

const clearTransactionsAsync = async () => {
  try {
      // Eliminar las transacciones almacenadas en AsyncStorage
      await AsyncStorage.removeItem('transactions');
      console.log('Transacciones eliminadas correctamente');
  } catch (error) {
      console.log('Error al eliminar las transacciones:', error);
  }
};

const deleteUserAsync = async () => {
  try {
      // Eliminar las transacciones almacenadas en AsyncStorage
      await AsyncStorage.removeItem('user');
      console.log('User eliminado Correctamente');
  } catch (error) {
      console.log('Error al eliminar las transacciones:', error);
  }
};

const updateUserNameAsync = async (newName) => {
  try {
    // Obtener el objeto "user" almacenado en AsyncStorage
    const userJSON = await AsyncStorage.getItem('user');

    if (userJSON) {
      // Convertir el objeto "user" a un objeto JavaScript
      const user = JSON.parse(userJSON);

      // Actualizar la propiedad .name del objeto "user" con el nuevo nombre
      user.name = newName;

      // Guardar el objeto "user" actualizado en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // El nombre del usuario se ha actualizado con éxito
      console.log('El nombre del usuario se ha actualizado con éxito.');
    } else {
      // No se encontró el objeto "user" en AsyncStorage
      console.log('No se encontró el objeto "user" en AsyncStorage.');
    }
  } catch (error) {
    // Ocurrió un error durante la operación
    console.error('Error al actualizar el nombre del usuario:', error);
  }
};



const expensiaAsyncStorage = {
    addTransactionAsync: addTransactionAsync,
    editTransactionAsync: editTransactionAsync,
    deleteTransactionAsync: deleteTransactionAsync,
    checkUserExists: checkUserExists,
    createUserAsync: createUserAsync,
    addOrRestAmountAsync: addOrRestAmountAsync,
    editAccountAsync: editAccountAsync,
    addAccountAsync: addAccountAsync,
    deleteAccountAsync: deleteAccountAsync,
    togglePrivacyAsyncStorage: togglePrivacyAsyncStorage,
    editUserLanguageAsync: editUserLanguageAsync,
    clearTransactionsAsync: clearTransactionsAsync,
    deleteUserAsync: deleteUserAsync,
    updateUserNameAsync: updateUserNameAsync
    
    
}

export default expensiaAsyncStorage;
