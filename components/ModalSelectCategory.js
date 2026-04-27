import { useContext, useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { ExpensiaContext } from '../context/expensiaContext'
import { es, en } from '../utils/languages'
import Category from '../utils/category'
import { useCustomCategories } from '../hooks/queries'
import { TouchableOpacity as BSTouch, BottomSheetModal } from '@gorhom/bottom-sheet'
import containerComponent from '@utils/bottomSheetContainer'
import CreateCategorySheet from './CreateCategorySheet'

const ModalSelectCategory = ({ modalVisible, setModalVisible, selectedValue, handleSelectedModal, type }) => {
  const { user } = useContext(ExpensiaContext)
  const strings = user?.language === 'en' ? en : es
  const t = strings.createCategorySheet

  const { data: customCategoriesData = [] } = useCustomCategories()

  const [createVisible, setCreateVisible] = useState(false)
  const pendingOpenCreateRef = useRef(false)

  // Built-in categories filtered by type
  const builtIn = type ? Category.filter(c => c.type === type) : Category

  // Custom categories filtered by type, normalized to the same shape
  const custom = (type
    ? customCategoriesData.filter(c => c.type === type)
    : customCategoriesData
  ).map(c => ({ id: c.id, nameEN: c.name, nameES: c.name, type: c.type, icon: c.icon, isCustom: true }))

  const handleSendSelected = (item) => {
    handleSelectedModal(item)
    setModalVisible(false)
  }

  const handleCategoryCreated = (newCategory) => {
    // Normalize and auto-select the newly created category, then close both sheets
    const normalized = {
      id: newCategory.id,
      nameEN: newCategory.name,
      nameES: newCategory.name,
      type: newCategory.type,
      icon: newCategory.icon,
      isCustom: true,
    }
    handleSendSelected(normalized)
  }

  const handleOpenCreateCategory = () => {
    // Open create sheet only after parent selector is fully dismissed.
    pendingOpenCreateRef.current = true
    setModalVisible(false)
  }

  useEffect(() => {
    if (modalVisible) handleOpenModal()
    else closeModal()
  }, [modalVisible])

  const presentRef = useRef(null)
  const snapPoints = useMemo(() => ['30%', '60%', '90%'], [])
  const closeModal = () => presentRef.current?.close()
  const handleOpenModal = useCallback(() => { presentRef.current?.present() }, [])

  return (
    <>
      <BottomSheetModal
        index={1}
        ref={presentRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enableDismissOnClose
        containerComponent={containerComponent}
        onDismiss={() => {
          setModalVisible(false)
          if (pendingOpenCreateRef.current) {
            pendingOpenCreateRef.current = false
            setCreateVisible(true)
          }
        }}
        handleIndicatorStyle={{ backgroundColor: Colors.sheetHandle }}
        handleComponent={() => (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 40, height: 4, backgroundColor: Colors.sheetHandle, marginTop: 10, borderRadius: 2 }} />
          </View>
        )}
        backgroundStyle={{ backgroundColor: Colors.sheetBackground, borderWidth: 1, borderColor: Colors.sheetBorder, borderRadius: 40 }}
      >
        <View style={styles.closeRow}>
          <BSTouch onPress={closeModal}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.sheetHandle} />
          </BSTouch>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', marginTop: 8 }}>
          {/* Built-in categories */}
          {builtIn.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.rowModule, selectedValue?.id === category.id && styles.rowSelectedModule]}
              onPress={() => handleSendSelected(category)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name={category.icon} size={28} color={Colors.secondary} style={styles.iconCategory} />
                <Text weight="bold" color="primary" size="l">
                  {user?.language === 'en' ? category.nameEN : category.nameES}
                </Text>
              </View>
              {selectedValue?.id === category.id && <MaterialIcons name="check" size={24} color={Colors.primary} />}
            </TouchableOpacity>
          ))}

          {/* Custom categories section */}
          {custom.length > 0 && (
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text color="primary" style={styles.sectionLabel}>{t.myCategoriesLabel}</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {custom.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.rowModule, selectedValue?.id === category.id && styles.rowSelectedModule]}
              onPress={() => handleSendSelected(category)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name={category.icon} size={28} color={Colors.secondary} style={styles.iconCategory} />
                <Text weight="bold" color="primary" size="l">{category.nameES}</Text>
              </View>
              {selectedValue?.id === category.id && <MaterialIcons name="check" size={24} color={Colors.primary} />}
            </TouchableOpacity>
          ))}

          {/* Create new category button */}
          <TouchableOpacity style={styles.newCatBtn} onPress={handleOpenCreateCategory}>
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color={Colors.secondary} />
            <Text color="primary" style={styles.newCatTxt}>{t.newCategoryBtn}</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetModal>

      <CreateCategorySheet
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSaved={handleCategoryCreated}
        initialType={type}
      />
    </>
  )
}

export default ModalSelectCategory

const styles = StyleSheet.create({
  closeRow: {
    alignItems: 'flex-end',
    width: '95%',
    alignSelf: 'center',
  },
  rowModule: {
    flexDirection: 'row',
    padding: 10,
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowSelectedModule: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.secondary,
  },
  iconCategory: {
    marginRight: '5%',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginVertical: 12,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.sheetBorder,
  },
  sectionLabel: {
    fontSize: 12,
    opacity: 0.5,
  },
  newCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    width: '90%',
    marginTop: 4,
    marginBottom: 24,
  },
  newCatTxt: {
    fontSize: 15,
    opacity: 0.7,
  },
})
