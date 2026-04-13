import { LogBox } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useContext, useCallback } from 'react'
import { useFonts } from 'expo-font'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
// Screens
import MainScreen from './screens/MainScreen'
import SettingsScreen from './screens/SettingsScreen'
import TypeTransactionScreen from './screens/TypeTransactionScreen'
import TransactionScreen from './screens/TransactionScreen'
import TransactionsScreen from './screens/TransactionsScreen'
import WalletScreen from './screens/WalletScreen'
import CreateUserScreen from './screens/CreateUserScreen'
import CreateAccountsScreen from './screens/CreateAccountsScreen'
import DayTransactionScreen from './screens/DayTransactionScreen'
import CreateCCScreen from './screens/CreateCCScreen'
// Components
import GoBackBtn from './components/GoBackBtn'
// Context
import ExpensiaContextProvider, { ExpensiaContext } from './context/expensiaContext'
import { AuthContextProvider, useAuth } from './context/authContext'
// Services
import { processQueue } from './services/syncService'
// Hooks
import { useNetworkStatus } from './hooks/useNetworkStatus'
// Utils
import Colors from './constants/colors'
import { es, en } from './utils/languages'

LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.'])

const Stack = createNativeStackNavigator()
const Tab = createMaterialTopTabNavigator()

const TabNavigation = () => {
  const { user } = useContext(ExpensiaContext)
  const strings = user && user.language === 'en' ? en : es

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="Summary"
      screenOptions={{
        tabBarStyle: { backgroundColor: Colors.primary, width: 'auto' },
        tabBarLabelStyle: { fontFamily: 'Poppins-Light', fontSize: 10 },
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarActiveTintColor: Colors.light,
        tabBarIndicatorStyle: { backgroundColor: Colors.accent, top: 0, height: 4 }
      }}>
      <Tab.Screen name="Summary" component={MainScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />, title: strings.appJS.summary }}
      />
      <Tab.Screen name="Transactions" component={TransactionsScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />, title: strings.appJS.transactions }}
      />
      <Tab.Screen name="Wallet" component={WalletScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={24} color={color} />, title: strings.appJS.wallet }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen}
        options={{ tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />, title: strings.appJS.settings }}
      />
    </Tab.Navigator>
  )
}

const StackNavigation = () => {
  const { user } = useContext(ExpensiaContext)
  const { isLoggedIn } = useAuth()

  const handleReconnect = useCallback(() => {
    if (isLoggedIn) processQueue()
  }, [isLoggedIn])

  useNetworkStatus(handleReconnect)

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigation} options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="TypeTransaction" component={TypeTransactionScreen}
            options={{ animation: 'slide_from_bottom', headerShown: false, presentation: 'transparentModal' }}
          />
          <Stack.Screen name="Transaction" component={TransactionScreen}
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
          <Stack.Screen name="DayTransaction" component={DayTransactionScreen}
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
      ) : (
        <>
          <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateAccounts" component={CreateAccountsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateCCScreen" component={CreateCCScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  )
}

const App = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Light': require('./assets/fonts/Poppins-Light.ttf'),
  })

  if (!fontsLoaded) return null

  return (
    <AuthContextProvider>
      <ExpensiaContextProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <NavigationContainer>
              <StackNavigation />
            </NavigationContainer>
            <Toast />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ExpensiaContextProvider>
    </AuthContextProvider>
  )
}

export default App
