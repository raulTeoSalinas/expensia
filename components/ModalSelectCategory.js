import { useContext, useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import Text from '@components/Text'
import Colors from '../constants/colors'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { ExpensiaContext } from '../context/expensiaContext'
import { es, en } from '../utils/languages'
import Category from '../utils/category'
import { useCustomCategories } from '../hooks/queries'
import { TouchableOpacity as BSTouch, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import containerComponent from '@utils/bottomSheetContainer'
import CreateCategorySheet from './CreateCategorySheet'
import { sortCategoriesByDisplayName } from '../utils/sortCategoriesByDisplayName'

function categoryMatchesQuery(category, qRaw) {
  const q = qRaw.trim().toLowerCase()
  if (!q) return true
  const nEs = (category.nameES ?? '').toLowerCase()
  const nEn = (category.nameEN ?? '').toLowerCase()
  return nEs.includes(q) || nEn.includes(q)
}

function categoryIconColor(category) {
  return category.type === 'i' ? Colors.secondary : Colors.accent
}

const ModalSelectCategory = ({ modalVisible, setModalVisible, selectedValue, handleSelectedModal, type }) => {
  const { user } = useContext(ExpensiaContext)
  const strings = user?.language === 'en' ? en : es
  const t = strings.createCategorySheet
  const ms = strings.modalSelectCategory

  const { data: customCategoriesData = [] } = useCustomCategories()

  const [createVisible, setCreateVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pendingOpenCreateRef = useRef(false)

  const lang = user?.language === 'en' ? 'en' : 'es'

  const builtIn = useMemo(
    () =>
      sortCategoriesByDisplayName(
        type ? Category.filter((c) => c.type === type) : Category,
        lang
      ),
    [type, lang]
  )

  const custom = useMemo(
    () =>
      sortCategoriesByDisplayName(
        (type ? customCategoriesData.filter((c) => c.type === type) : customCategoriesData).map((c) => ({
          id: c.id,
          nameEN: c.name,
          nameES: c.name,
          type: c.type,
          icon: c.icon,
          isCustom: true,
        })),
        lang
      ),
    [type, customCategoriesData, lang]
  )

  const totalCategories = builtIn.length + custom.length
  const manyCategories = totalCategories > 5

  const filteredBuiltIn = useMemo(() => {
    if (!manyCategories) return builtIn
    if (!searchQuery.trim()) return builtIn
    return builtIn.filter((c) => categoryMatchesQuery(c, searchQuery))
  }, [builtIn, manyCategories, searchQuery])

  const filteredCustom = useMemo(() => {
    if (!manyCategories) return custom
    if (!searchQuery.trim()) return custom
    return custom.filter((c) => categoryMatchesQuery(c, searchQuery))
  }, [custom, manyCategories, searchQuery])

  const showCustomSection =
    custom.length > 0 &&
    (!manyCategories || !searchQuery.trim() || filteredCustom.length > 0)

  const noMatches = manyCategories && filteredBuiltIn.length === 0 && filteredCustom.length === 0

  const snapPoints = useMemo(
    () => (manyCategories ? ['90%'] : ['30%', '60%', '90%']),
    [manyCategories]
  )
  const initialSnapIndex = manyCategories ? 0 : 1

  const handleSendSelected = (item) => {
    handleSelectedModal(item)
    setModalVisible(false)
  }

  const handleCategoryCreated = (newCategory) => {
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
    pendingOpenCreateRef.current = true
    setModalVisible(false)
  }

  const presentRef = useRef(null)
  const closeModal = useCallback(() => presentRef.current?.close(), [])
  const handleOpenModal = useCallback(() => {
    presentRef.current?.present()
  }, [])

  useEffect(() => {
    if (modalVisible) {
      handleOpenModal()
    } else {
      setSearchQuery('')
      closeModal()
    }
  }, [modalVisible, handleOpenModal, closeModal])

  const newCatIconColor = type === 'i' ? Colors.secondary : type === 'e' ? Colors.accent : Colors.primary

  const categoryLabel = (category) => (user?.language === 'en' ? category.nameEN : category.nameES)

  return (
    <>
      <BottomSheetModal
        key={manyCategories ? 'category-sheet-large' : 'category-sheet-default'}
        index={initialSnapIndex}
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
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
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

        <Text weight="bold" color="primary" size="l" style={styles.chooseTxt}>
          {ms.chooseCategory}
        </Text>

        {manyCategories && (
          <View style={styles.searchWrap}>
            <BottomSheetTextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={ms.searchPlaceholder}
              placeholderTextColor={Colors.placeholder}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <MaterialIcons name="search" size={22} color={Colors.primary} style={styles.searchIcon} />
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {noMatches ? (
            <Text color="placeholder" size="m" style={styles.noResults}>
              {ms.noResults}
            </Text>
          ) : (
            <>
              {filteredBuiltIn.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.rowModule, selectedValue?.id === category.id && styles.rowSelectedModule]}
                  onPress={() => handleSendSelected(category)}
                >
                  <View style={styles.rowLeading}>
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={28}
                      color={categoryIconColor(category)}
                      style={styles.iconCategory}
                    />
                    <Text weight="bold" color="primary" size="l" numberOfLines={1} ellipsizeMode="tail">
                      {categoryLabel(category)}
                    </Text>
                  </View>
                  {selectedValue?.id === category.id && (
                    <MaterialIcons name="check" size={24} color={Colors.primary} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}

              {showCustomSection && (
                <>
                  <View style={styles.sectionDivider}>
                    <View style={styles.dividerLine} />
                    <Text color="primary" style={styles.sectionLabel}>
                      {t.myCategoriesLabel}
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {filteredCustom.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.rowModule, selectedValue?.id === category.id && styles.rowSelectedModule]}
                      onPress={() => handleSendSelected(category)}
                    >
                      <View style={styles.rowLeading}>
                        <MaterialCommunityIcons
                          name={category.icon}
                          size={28}
                          color={categoryIconColor(category)}
                          style={styles.iconCategory}
                        />
                        <Text weight="bold" color="primary" size="l" numberOfLines={1} ellipsizeMode="tail">
                          {categoryLabel(category)}
                        </Text>
                      </View>
                      {selectedValue?.id === category.id && (
                        <MaterialIcons name="check" size={24} color={Colors.primary} style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </>
          )}

          <TouchableOpacity style={styles.newCatBtn} onPress={handleOpenCreateCategory}>
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color={newCatIconColor} />
            <Text color="primary" style={styles.newCatTxt}>
              {t.newCategoryBtn}
            </Text>
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
  chooseTxt: {
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.secondary,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Light',
    fontSize: 15,
    color: Colors.primary,
    paddingVertical: 8,
    minWidth: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 24,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
  },
  rowModule: {
    flexDirection: 'row',
    padding: 10,
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 8,
  },
  rowSelectedModule: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.secondary,
  },
  iconCategory: {
    marginRight: '5%',
  },
  checkIcon: {
    flexShrink: 0,
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
    marginBottom: 8,
  },
  newCatTxt: {
    fontSize: 15,
    opacity: 0.7,
  },
})
