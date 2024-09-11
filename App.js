// React / React-Native
import { LogBox, View, ActivityIndicator, Image } from 'react-native';
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
import CreateCCScreen from "./screens/CreateCCScreen";
// Components
import GoBackBtn from './components/GoBackBtn';
// Utils
import Colors from './utils/colors';
import { es, en } from "./utils/languages";
// AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import expensiaAsyncStorage from './context/expensiaAsyncStorage';
// Context
import { ExpensiaContext } from "./context/expensiaContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';



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
          tabBarLabelStyle: { fontFamily: 'Poppins-Light', fontSize: 10 },
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

const StackNavigation = () => {

  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useContext(ExpensiaContext);
  const { clearTransactionsAsync, deleteUserAsync, editUserLanguageAsync, updateUserNameAsync, togglePrivacyAsyncStorage } = expensiaAsyncStorage;
  const handleDeleteAll = async () => {
    try {
      await clearTransactionsAsync();

      await deleteUserAsync();
      setModalVisibleDeleteAll(false);
    } catch (error) {
      console.log("Error deleting user or clearing transactions:", error);
    }
  };
  useEffect(() => {
    // handleDeleteAll()
    const fetchUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");

        if (userString !== null) {
          const user = JSON.parse(userString);
          setUser(user); // Asegúrate de que setUser sea una función válida
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Error al obtener el usuario:", error);
        setUser(null);
      } finally {
        setIsLoading(false); // Finaliza la carga una vez se obtenga el usuario
      }
    };
    fetchUser(); // Llama la función solo una vez, al montar el componente
  }, []);


  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#06002e" }}>
        <Image
          source={require('./assets/splash.png')}
          style={{ width: '100%', height: '100%', }}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <Stack.Navigator>

      {user ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigation} options={{ headerShown: false, gestureEnabled: false }} />
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
              headerTitleStyle: { fontFamily: 'Poppins-SemiBold' },
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
              headerTitleStyle: { fontFamily: 'Poppins-SemiBold' },
              headerStyle: { backgroundColor: Colors.light },
              headerTintColor: Colors.primary,
            }}
          />
        </>
      ) :
        (
          <>
            <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ headerShown: false }} />


            <Stack.Screen name="CreateAccounts" component={CreateAccountsScreen}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen name="CreateCCScreen" component={CreateCCScreen}
              options={{
                headerShown: false
              }}
            />
          </>
        )
      }
    </Stack.Navigator>
  )
}

const App = () => {

  const [fontsLoaded] = useFonts({
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Light': require('./assets/fonts/Poppins-Light.ttf'),

  });

  if (!fontsLoaded) {
    return null; // Optionally, return a loading screen or spinner
  }

  return (
    <ExpensiaContextProvider>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <StatusBar style='dark' />
          <NavigationContainer>
            <StackNavigation />
          </NavigationContainer>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ExpensiaContextProvider>
  );
};


export default App;


