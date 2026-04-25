import { useContext } from 'react'
import { SafeAreaView, StyleSheet, FlatList, View, TouchableOpacity, Image } from 'react-native'
import Text from '@components/Text'
import { Ionicons } from '@expo/vector-icons'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import GradientText from '../components/TextGradient'
import TransactionCard from '../components/TransactionCard'
import { ExpensiaContext } from '../context/expensiaContext'
import { useDayTransactions } from '../hooks/queries'

const DayTransactionScreen = ({ route, navigation }) => {
    const dayClicked = route.params.dateString
    const { user } = useContext(ExpensiaContext)
    const strings = user?.language === 'en' ? en : es

    const { data: transactions = [] } = useDayTransactions(dayClicked)

    return (
        <SafeAreaView style={styles.mainContainer}>
            {/* Custom header — bypasses iOS 26 UIKit glass on nav bar buttons */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
                    <Ionicons name="caret-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitleRow}>
                    <Text weight="bold" color="primary" style={styles.headerTxt}>
                        {strings.transactionsScreen.headerGradientTxt}
                    </Text>
                    <GradientText style={styles.headerGradientTxt}>{` ${dayClicked}`}</GradientText>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('TypeTransaction', { date: dayClicked })}
                >
                    <Image style={styles.addBtnIcon} source={require('../assets/images/icon-plus.png')} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={transactions}
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
                        accountName={item.accountName}
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
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: Colors.sheetBorder,
    },
    headerTitleRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTxt: {
        fontSize: 20,
    },
    headerGradientTxt: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20,
    },
    addBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnIcon: {
        resizeMode: 'contain',
        width: 38,
        height: 38,
    },
})
