import { useState, useContext } from 'react'
import {
    StyleSheet,
    SafeAreaView,
    View,
    TextInput,
    Dimensions,
    FlatList,
    ActivityIndicator
} from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import SelectType from '../components/SelectType'
import TransactionCard from '../components/TransactionCard'
import Header from '../components/Header'
import { Ionicons } from '@expo/vector-icons'
import { ExpensiaContext } from '../context/expensiaContext'
import { useTransactions, useTransactionSearch } from '../hooks/queries'

const { width } = Dimensions.get('window')

const TransactionsScreen = () => {
    const { user } = useContext(ExpensiaContext)
    const strings = user?.language === 'en' ? en : es

    const [selectedType, setSelectedType] = useState('all')
    const [txtSearch, setTxtSearch] = useState('')

    const isSearching = txtSearch.length > 0

    // Infinite scroll — sin búsqueda
    const {
        data: pages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useTransactions({ type: selectedType })

    // Búsqueda directa a SQLite
    const { data: searchResults = [] } = useTransactionSearch(txtSearch, selectedType)

    const transactions = isSearching
        ? searchResults
        : (pages?.pages.flat() ?? [])

    const renderItem = ({ item }) => (
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
    )

    return (
        <SafeAreaView style={styles.mainContainer}>
            <Header
                darkText={strings.transactionsScreen.headerDarkTxt}
                gradientText={strings.transactionsScreen.headerGradientTxt}
                addBtn
            />

            <View style={{ alignItems: 'center' }}>
                <View style={styles.txtSearchContainer}>
                    <TextInput
                        style={styles.txtSearch}
                        onChangeText={setTxtSearch}
                        value={txtSearch}
                        inputMode="text"
                        returnKeyType="done"
                        placeholder={strings.transactionsScreen.searchPlaceHolder}
                        blurOnSubmit
                    />
                    <Ionicons name="search" size={24} color="black" style={{ marginRight: 15 }} />
                </View>
            </View>

            <SelectType getTypeSelected={setSelectedType} />

            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                contentContainerStyle={{ alignItems: 'center', paddingTop: 10 }}
                renderItem={renderItem}
                onEndReached={() => { if (!isSearching && hasNextPage) fetchNextPage() }}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={() => (
                    <View>
                        <Text>{strings.transactionsScreen.emptyListTxt}</Text>
                    </View>
                )}
                ListFooterComponent={() =>
                    isFetchingNextPage
                        ? <ActivityIndicator size="small" color={Colors.secondary} style={{ marginVertical: 16 }} />
                        : null
                }
            />
        </SafeAreaView>
    )
}

export default TransactionsScreen

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    txtSearch: {
        height: 40,
        paddingHorizontal: 15,
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        width: '90%',
        color: Colors.primary
    },
    txtSearchContainer: {
        backgroundColor: Colors.white,
        borderColor: Colors.secondary,
        borderWidth: 0.5,
        width: width - 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'space-between'
    }
})
