import { LogBox, View, ActivityIndicator, Text } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useContext, useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
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
import CustomCategoriesScreen from './screens/CustomCategoriesScreen'
import IATransactionsScreen from './screens/IATransactionsScreen'
import ChatScreen from './screens/ChatScreen'
// Components
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

const queryClient = new QueryClient()

const Stack = createNativeStackNavigator()
const Tab = createMaterialTopTabNavigator()

const tabScreen = (title, iconName) => ({
  tabBarIcon: ({ color }) => <Ionicons name={iconName} size={22} color={color} />,
  tabBarLabel: ({ color }) => (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={{ color, fontFamily: 'Poppins-Light', fontSize: 10 }}
    >
      {title}
    </Text>
  ),
})

const TabNavigation = () => {
  const { user } = useContext(ExpensiaContext)
  const { isLoggedIn } = useAuth()
  const insets = useSafeAreaInsets()
  const strings = user && user.language === 'en' ? en : es

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="Summary"
      screenOptions={{
        tabBarStyle: { backgroundColor: Colors.primary, width: 'auto', paddingBottom: insets.bottom >= 8 ? insets.bottom - 8 : 0 },
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarActiveTintColor: Colors.light,
        tabBarIndicatorStyle: { backgroundColor: Colors.accent, top: 0, height: 4 },
        tabBarItemStyle: { paddingHorizontal: 4, paddingBottom: 0 },
      }}>
      <Tab.Screen name="Summary" component={MainScreen}
        options={tabScreen(strings.appJS.summary, 'calendar-outline')}
      />
      <Tab.Screen name="Transactions" component={TransactionsScreen}
        options={tabScreen(strings.appJS.transactions, 'list')}
      />
      <Tab.Screen name="Wallet" component={WalletScreen}
        options={tabScreen(strings.appJS.wallet, 'wallet-outline')}
      />
      {isLoggedIn && (
        <Tab.Screen name="AIChat" component={ChatScreen}
          options={tabScreen(strings.appJS.chat, 'chatbubble-ellipses-outline')}
        />
      )}
      <Tab.Screen name="Settings" component={SettingsScreen}
        options={tabScreen(strings.appJS.settings, 'settings-outline')}
      />
    </Tab.Navigator>
  )
}

const StackNavigation = () => {
  const { user, dbReady } = useContext(ExpensiaContext)
  const { isLoggedIn } = useAuth()

  const handleReconnect = useCallback(() => {
    if (isLoggedIn) processQueue()
  }, [isLoggedIn])

  useNetworkStatus(handleReconnect)

  if (!dbReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light }}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    )
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigation} options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="TypeTransaction" component={TypeTransactionScreen}
            options={{ animation: 'slide_from_bottom', headerShown: false, presentation: 'transparentModal' }}
          />
          <Stack.Screen name="Transaction" component={TransactionScreen}
            options={{ animation: 'slide_from_bottom', presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen name="DayTransaction" component={DayTransactionScreen}
            options={{ animation: 'slide_from_bottom', headerShown: false }}
          />
          <Stack.Screen name="CustomCategories" component={CustomCategoriesScreen}
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
          <Stack.Screen name="IATransactions" component={IATransactionsScreen}
            options={{ headerShown: false, presentation: "fullScreenModal", animation: "fade" }}
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

const AppShell = () => {
  const insets = useSafeAreaInsets()
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <StackNavigation />
        </NavigationContainer>
        <Toast topOffset={insets.top} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

const App = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Light': require('./assets/fonts/Poppins-Light.ttf'),
  })

  if (!fontsLoaded) return null

  return (
    <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <ExpensiaContextProvider>
        <SafeAreaProvider>
          <AppShell />
        </SafeAreaProvider>
      </ExpensiaContextProvider>
    </AuthContextProvider>
    </QueryClientProvider>
  )
}

export default App
