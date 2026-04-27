import { useState, useContext } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import Text from '@components/Text'
import GradientText from '../components/TextGradient'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import ModalDelete from '@components/ModalDelete'
import CreateCategorySheet from '../components/CreateCategorySheet'
import Colors from '../constants/colors'
import { es, en } from '../utils/languages'
import { ExpensiaContext } from '../context/expensiaContext'
import { useCustomCategories } from '../hooks/queries'

const CustomCategoriesScreen = ({ navigation }) => {
  const { user, deleteCustomCategory } = useContext(ExpensiaContext)
  const strings = user?.language === 'en' ? en : es
  const t = strings.customCategoriesScreen
  const { data: categories = [] } = useCustomCategories()

  const [sheetVisible, setSheetVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)

  const expenses = categories.filter(c => c.type === 'e')
  const income = categories.filter(c => c.type === 'i')

  const handleAdd = () => {
    setEditingCategory(null)
    setSheetVisible(true)
  }

  const handleEdit = (cat) => {
    setEditingCategory(cat)
    setSheetVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    await deleteCustomCategory(deletingCategory.id)
    setDeletingCategory(null)
  }

  const renderRow = (cat) => (
    <View key={cat.id} style={styles.row}>
      <View style={styles.rowLeft}>
        <MaterialCommunityIcons name={cat.icon} size={28} color={Colors.secondary} style={styles.rowIcon} />
        <Text weight="bold" color="primary">{cat.name}</Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity onPress={() => handleEdit(cat)} hitSlop={8} style={styles.actionBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDeletingCategory(cat)} hitSlop={8} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.main}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
            <Ionicons name="caret-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <Text weight="bold" color="primary" style={styles.headerTxt}>{t.headerDark}</Text>
            <GradientText style={styles.headerGradientTxt}>{t.headerGradient}</GradientText>
          </View>
          <TouchableOpacity onPress={handleAdd} hitSlop={12}>
            <Ionicons name="add-circle-outline" size={28} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {categories.length === 0 && (
            <Text color="primary" style={styles.empty}>{t.empty}</Text>
          )}

          {expenses.length > 0 && (
            <>
              <Text weight="bold" color="primary" style={styles.sectionLabel}>{t.sectionExpenses}</Text>
              {expenses.map(renderRow)}
            </>
          )}

          {income.length > 0 && (
            <>
              <Text weight="bold" color="primary" style={styles.sectionLabel}>{t.sectionIncome}</Text>
              {income.map(renderRow)}
            </>
          )}
        </ScrollView>

        <CreateCategorySheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          editingCategory={editingCategory}
          initialType={null}
        />

        <ModalDelete
          title={t.deleteCatTitle}
          description={t.deleteCatDesc}
          modalVisible={!!deletingCategory}
          setModalVisible={(v) => { if (!v) setDeletingCategory(null) }}
          onPressDelete={handleDeleteConfirm}
        />
    </SafeAreaView>
  )
}

export default CustomCategoriesScreen

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.sheetBorder,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 12,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  empty: {
    opacity: 0.4,
    marginTop: 40,
    textAlign: 'center',
  },
})
