import { useState, useContext } from 'react'
import {
    StyleSheet,
    SafeAreaView,
    View,
    TextInput,
    Dimensions,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import TransactionCard from '../components/TransactionCard'
import Header from '../components/Header'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { ExpensiaContext } from '../context/expensiaContext'
import {
    useTransactions,
    useTransactionSearch,
    useFilteredTransactions,
    useAccounts,
} from '../hooks/queries'
import { useCustomCategories } from '../hooks/queries'
import FilterSheet, { DEFAULT_FILTERS, countActiveFilters } from '../components/FilterSheet'

const { width } = Dimensions.get('window')

const TransactionsScreen = () => {
    const { user } = useContext(ExpensiaContext)
    const strings = user?.language === 'en' ? en : es

    const [txtSearch, setTxtSearch] = useState('')
    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const [filterVisible, setFilterVisible] = useState(false)

    const { data: customCats = [] } = useCustomCategories()
    const { data: accounts = [] } = useAccounts()

    const isSearching = txtSearch.length > 0
    const activeCount = countActiveFilters(filters)
    const hasFilters = activeCount > 0

    // Infinite scroll — base list, no extra filters
    const {
        data: pages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useTransactions({ type: filters.type })

    // Filtered list — when extra filters beyond type are active
    const { data: filteredResults = [] } = useFilteredTransactions(filters, {
        enabled: !isSearching && hasFilters,
    })

    // Search
    const { data: searchResults = [] } = useTransactionSearch(txtSearch, filters)

    const transactions = isSearching
        ? searchResults
        : hasFilters
            ? filteredResults
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
                    <View style={styles.searchRow}>
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
                        <TouchableOpacity style={[styles.filterBtn, activeCount > 0 && styles.filterBtnActive]} onPress={() => setFilterVisible(true)}>
                            <MaterialCommunityIcons name="tune-variant" size={22} color={activeCount > 0 ? Colors.white : Colors.primary} />
                            {activeCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeTxt}>{activeCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={transactions}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ alignItems: 'center', paddingTop: 10 }}
                    renderItem={renderItem}
                    onEndReached={() => { if (!isSearching && !hasFilters && hasNextPage) fetchNextPage() }}
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

                <FilterSheet
                    visible={filterVisible}
                    onClose={() => setFilterVisible(false)}
                    filters={filters}
                    onApply={setFilters}
                    customCats={customCats}
                    accounts={accounts}
                    strings={strings.filterSheet}
                    language={user?.language ?? 'es'}
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: width - 40,
    },
    txtSearch: {
        height: 40,
        paddingHorizontal: 15,
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        width: '90%',
        color: Colors.primary,
    },
    txtSearchContainer: {
        flex: 1,
        backgroundColor: Colors.white,
        borderColor: Colors.secondary,
        borderWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        justifyContent: 'space-between',
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.white,
        borderWidth: 0.5,
        borderColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: Colors.secondary,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeTxt: {
        fontSize: 10,
        color: Colors.white,
        fontFamily: 'Poppins-Bold',
    },
})
