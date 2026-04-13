import { useLayoutEffect, useContext } from 'react'
import { SafeAreaView, StyleSheet, FlatList, View } from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import HeaderTitle from '../components/HeaderTitle'
import TransactionCard from '../components/TransactionCard'
import { ExpensiaContext } from '../context/expensiaContext'

const DayTransactionScreen = ({ route, navigation }) => {
    const dayClicked = route.params.dateString
    const { transactions, user } = useContext(ExpensiaContext)
    const strings = user && user.language === 'en' ? en : es

    useLayoutEffect(() => {
        navigation.setOptions({
            title: ` ${dayClicked}`,
            headerTitle: ({ children }) => <HeaderTitle title={strings.transactionsScreen.headerGradientTxt} children={children} />
        })
    }, [])

    const filteredTransactions = transactions.filter(t => t.date === dayClicked)

    return (
        <SafeAreaView style={styles.mainContainer}>
            <FlatList
                data={filteredTransactions}
                keyExtractor={item => item.id}
                contentContainerStyle={{ alignItems: 'center', paddingTop: 10 }}
                renderItem={({ item }) => (
                    <TransactionCard
                        id={item.id}
                        type={item.type}
                        amount={item.amount}
                        date={item.date}
                        description={item.description}
                        accountId={item.accountId}
                        globalCategoryId={item.globalCategoryId}
                        customCategoryId={item.customCategoryId}
                        customCategoryName={item.customCategoryName}
                        syncStatus={item.syncStatus}
                    />
                )}
                ListEmptyComponent={() => (
                    <View>
                        <Text>{strings.transactionsScreen.emptyListTxt}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

export default DayTransactionScreen

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,
        flexDirection: 'row'
    }
})
