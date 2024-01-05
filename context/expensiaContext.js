// React / React-Native
import { createContext, useState, useEffect} from "react"; 
// AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
// Models
import Transaction from "../models/transaction";

export const ExpensiaContext = createContext({
  transactions: [],
  addTransaction: (tran) => {},
  removeTransaction: (id) => {},
  editTransaction: (id, tran) => {},
  user: null
});

const ExpensiaContextProvider = ({ children }) => {

    const [transactions, setTransactions] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const fetchTransactions = async () => {
        try {
          const transactionsString = await AsyncStorage.getItem("transactions");
  
          if (transactionsString !== null) {
            const transactions = JSON.parse(transactionsString);
            setTransactions(transactions);
          } else {
            setTransactions([]);
          }
        } catch (error) {
          console.log("Error al obtener las transacciones:", error);
          setTransactions([]);
        }
      };

      const fetchUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");

        if (userString !== null) {
          const user = JSON.parse(userString);
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Error al obtener el usuario:", error);
        setUser(null);
      }
    };

    fetchTransactions();
    fetchUser();
  }, []);
  
  
    const addTransaction = (id, type, amount, account, date, category, description) => {
      const transaction = new Transaction(id, type, amount, account, date, category, description);
      setTransactions((currentTransac) => [...currentTransac, transaction]);

    };
  
    const createUser = (name, accounts, language) => {
      
        const user = {
          name: name,
          accounts: accounts,
          privacy: false,
          language: language
        };
        
        // Guarda el objeto de usuario en AsyncStorage
        setUser(user)

    };


    const addOrRestAmount = (amount, type, account) => {
      setUser(prevUser => {
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
    
        return {
          ...prevUser,
          accounts: updatedAccounts
        };
      });
    };

    const removeTransaction = (id) => {
      setTransactions((currentTransac) =>
        currentTransac.filter((tran) => tran.id !== id)
      );
    };

    const editTransaction = (id, type, amount, account, date, category, description) => {
      setTransactions((currentTransac) =>
        currentTransac.map((tran) =>
          tran.id === id
            ? { id, type, amount, account, date, category, description }
            : tran
        )
      );
    };

    const editAccount = (id, name, icon) => {
      setUser(prevUser => {
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
    
        return {
          ...prevUser,
          accounts: updatedAccounts
        };
      });
    };
    


    const addAccount = (name, icon) => {
      setUser(prevUser => {
        const newId = prevUser.accounts.length === 0 ? 1 : Math.max(...prevUser.accounts.map(account => account.id)) + 1;
    
        const newAccount = {
          id: newId,
          name: name,
          icon: icon,
          amount: 0
        };
    
        const updatedAccounts = [...prevUser.accounts, newAccount];
    
        return {
          ...prevUser,
          accounts: updatedAccounts
        };
      });
    };


    const deleteAccount = (id) => {
      setUser(prevUser => {
        const updatedAccounts = prevUser.accounts.filter(prevAccount => prevAccount.id !== id);
    
        return {
          ...prevUser,
          accounts: updatedAccounts
        };
      });
    };

    const togglePrivacy = () => {
      setUser(prevUser => ({
        ...prevUser,
        privacy: !prevUser.privacy
      }));
    };


    const editUserLanguage = (language) => {
      setUser(prevUser => {
        // Crear un nuevo objeto "user" con el lenguaje actualizado
        const updatedUser = { ...prevUser, language: language };
    
        // Devolver el nuevo objeto "user" para actualizar el estado
        return updatedUser;
      });
    };

    const updateUserName = (newName) => {
      setUser(prevUser => ({
        ...prevUser,
        name: newName
      }));
    };
    
    const clearTransactions = () => {
      setTransactions([]);
    };

    const value = {
      transactions: transactions,
      addTransaction: addTransaction,
      removeTransaction: removeTransaction,
      editTransaction: editTransaction,
      user: user,
      createUser: createUser,
      addOrRestAmount: addOrRestAmount,
      editAccount: editAccount,
      addAccount: addAccount,
      deleteAccount: deleteAccount,
      togglePrivacy: togglePrivacy,
      editUserLanguage: editUserLanguage,
      updateUserName: updateUserName,
      clearTransactions: clearTransactions
    };
  
    return (
      <ExpensiaContext.Provider value={value}>
        {children}
      </ExpensiaContext.Provider>
    );
  };
  
  export default ExpensiaContextProvider;