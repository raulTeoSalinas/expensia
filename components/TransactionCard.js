import { useContext } from 'react'
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import formatNumberWithCommas from '../utils/formatNumberWithCommas'
import { es, en } from '../utils/languages'
import Category from '../utils/category'
import SyncStatusIcon from './SyncStatusIcon'
import { useNavigation } from '@react-navigation/native'
import { ExpensiaContext } from '../context/expensiaContext'

const { width } = Dimensions.get('window')

const TransactionCard = ({
  id, type, amount, date, description, syncStatus,
  accountId, globalCategoryId, customCategoryId,
  customCategoryName
}) => {
  const navigation = useNavigation()
  const { user, accounts } = useContext(ExpensiaContext)
  const strings = user && user.language === 'en' ? en : es

  const account = accounts.find(a => a.id === accountId)
  const accountName = account?.name ?? ''

  let categoryName = ''
  if (globalCategoryId) {
    const cat = Category.find(c => c.id === globalCategoryId)
    categoryName = cat ? (user?.language === 'en' ? cat.nameEN : cat.nameES) : globalCategoryId
  } else if (customCategoryId) {
    categoryName = customCategoryName ?? ''
  }

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Transaction', { id })}>
      <View style={[styles.cardContainer, { backgroundColor: type === 'i' ? Colors.secondary : Colors.accent }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: Colors.light }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text weight="bold" color="light" size="l">
              {type === 'i' ? strings.transactionCard.typeIncome : strings.transactionCard.typeExpense}
            </Text>
            <SyncStatusIcon syncStatus={syncStatus} />
          </View>
          <Text weight="bold" color="light" size="l">${formatNumberWithCommas(amount)}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
          <Text weight="bold" color="light">{strings.transactionCard.account}<Text color="light">{accountName}</Text></Text>
          <Text weight="bold" color="light">{strings.transactionCard.date}<Text color="light">{date}</Text></Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
          <Text weight="bold" color="light">{strings.transactionCard.category}
            <Text color="light">{categoryName}</Text>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
          <Text weight="bold" color="light">{strings.transactionCard.description}
            <Text color="light">
              {description
                ? (description.length > 15 ? description.slice(0, 20) + '...' : description)
                : strings.transactionCard.noDescription}
            </Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TransactionCard

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: 'stretch',
    width: width - 40,
    marginVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: Colors.white
  }
})
