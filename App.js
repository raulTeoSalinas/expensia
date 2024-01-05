// React / React-Native
import { LogBox} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useContext } from 'react';
import { useFonts } from 'expo-font';
// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// Icons
import { Ionicons } from '@expo/vector-icons';
// Screens
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import TypeTransactionScreen from './screens/TypeTransactionScreen';
import TransactionScreen from './screens/TransactionScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import WalletScreen from './screens/WalletScreen';
import ExpensiaContextProvider from './context/expensiaContext';
import CreateUserScreen from './screens/CreateUserScreen';
import CreateAccountsScreen from './screens/CreateAccountsScreen';
import DayTransactionScreen from './screens/DayTransactionScreen';
// Components
import GoBackBtn from './components/GoBackBtn';
// Utils
import Colors from './utils/colors';
import { es, en } from "./utils/languages";
// AsyncStorage
import expensiaAsyncStorage from './context/expensiaAsyncStorage';
// Context
import { ExpensiaContext } from "./context/expensiaContext";


LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);

const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();

const TabNavigation = () => {

  const { user } = useContext(ExpensiaContext);

  const strings = user && user.language === "en" ? en : es;

  return (

    <Tab.Navigator
      tabBarPosition='bottom'
      initialRouteName="MainScreen"
      screenOptions={
        {
          tabBarStyle: { backgroundColor: Colors.primary },
          tabBarLabelStyle: { fontFamily: 'poppins', fontSize: 10 },
          tabBarInactiveTintColor: "#8f8f8f97",
          tabBarActiveTintColor: Colors.light,
          tabBarIndicatorStyle: { backgroundColor: Colors.accent, top: 0, height: 4 }
        }
      }>

      <Tab.Screen name='Summary' component={MainScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
          title: strings.appJS.summary,
        }}

      />

      <Tab.Screen name='Transactions' component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
          title: strings.appJS.transactions,
        }}
      />

      <Tab.Screen name='Wallet' component={WalletScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={24} color={color} />
          ),
          title: strings.appJS.wallet
        }}
      />

      <Tab.Screen name='Settings' component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
          title: strings.appJS.settings
        }}
      />

    </Tab.Navigator>


  );
}

const App = () => {

  const { checkUserExists } = expensiaAsyncStorage;
  const [userExist, setUserExist] = useState();

  useEffect(() => {
    checkUserExists(setUserExist);
  }, []);

  const [fontsLoaded] = useFonts({
    'poppins': require('./assets/fonts/Poppins-Light.ttf'),
    'poppins-bold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    // Puedes mostrar una pantalla de carga o un indicador mientras las fuentes se cargan
    return null;
  }

  return (
    <ExpensiaContextProvider>
      <StatusBar style='dark' />
      <NavigationContainer>

        <Stack.Navigator initialRouteName={userExist ? "Tabs" : "CreateUser"}>


          <Stack.Screen name="Tabs" component={TabNavigation} options={{ headerShown: false, gestureEnabled: false }} />

          <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ headerShown: false }} />


          <Stack.Screen name="CreateAccounts" component={CreateAccountsScreen}
            options={{
              headerShown: false
            }}
          />

          <Stack.Screen name='TypeTransaction' component={TypeTransactionScreen}
            options={{
              animation: 'slide_from_bottom',
              headerShown: false,
              presentation: 'transparentModal',
            }}
          />

          <Stack.Screen name='Transaction' component={TransactionScreen}
            options={{
              animation: 'slide_from_bottom',
              headerBackTitleVisible: false,
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerLeft: GoBackBtn,
              headerTitleStyle: { fontFamily: 'poppins-bold' },
              headerStyle: { backgroundColor: Colors.light },
              headerTintColor: Colors.primary,
              presentation: 'modal',
            }}
          />

          <Stack.Screen name='DayTransaction' component={DayTransactionScreen}
            options={{
              animation: 'slide_from_bottom',
              headerBackTitleVisible: false,
              headerBackVisible: false,
              headerTitleAlign: 'center',
              headerLeft: GoBackBtn,
              headerTitleStyle: { fontFamily: 'poppins-bold' },
              headerStyle: { backgroundColor: Colors.light },
              headerTintColor: Colors.primary,
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </ExpensiaContextProvider>
  );
};


export default App;


