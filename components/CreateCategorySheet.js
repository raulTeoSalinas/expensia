import { useRef, useState, useEffect, useMemo, useContext } from 'react'
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import Text from '@components/Text'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BottomSheetModal, TouchableOpacity as BSTouch } from '@gorhom/bottom-sheet'
import containerComponent from '@utils/bottomSheetContainer'
import Colors from '../constants/colors'
import { getCategoryIconRows } from '../constants/categoryIcons'
import { ExpensiaContext } from '../context/expensiaContext'
import { es, en } from '../utils/languages'

export default function CreateCategorySheet({
  visible,
  onClose,
  onSaved,
  initialType,      // 'e' | 'i' | null — pre-selects type (hides toggle if set)
  editingCategory,  // null = create mode  |  {id, name, type, icon} = edit mode
}) {
  const { user, addCustomCategory, editCustomCategory } = useContext(ExpensiaContext)
  const strings = user?.language === 'en' ? en : es
  const t = strings.createCategorySheet

  const sheetRef = useRef(null)
  const snapPoints = useMemo(() => ['75%', '92%'], [])

  const [name, setName] = useState('')
  const [type, setType] = useState('e')
  const [icon, setIcon] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (visible) {
      setName(editingCategory?.name ?? '')
      setType(editingCategory?.type ?? initialType ?? 'e')
      setIcon(editingCategory?.icon ?? null)
      setSaving(false)
      sheetRef.current?.present()
    } else {
      sheetRef.current?.close()
    }
  }, [visible])

  const handleSave = async () => {
    if (!name.trim() || !icon) return
    setSaving(true)
    try {
      let category
      if (editingCategory) {
        await editCustomCategory(editingCategory.id, name.trim(), icon)
        category = { ...editingCategory, name: name.trim(), icon }
      } else {
        category = await addCustomCategory(name.trim(), type, icon)
      }
      onSaved?.(category)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const iconRows = getCategoryIconRows()
  const isEditing = !!editingCategory
  // Hide type toggle if we already know the type (coming from transaction screen)
  const showTypeToggle = !isEditing && !initialType
  const canSave = name.trim().length > 0 && icon !== null

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enableDismissOnClose
      containerComponent={containerComponent}
      onDismiss={onClose}
      handleIndicatorStyle={{ backgroundColor: Colors.sheetHandle }}
      handleComponent={() => (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 40, height: 4, backgroundColor: Colors.sheetHandle, marginTop: 10, borderRadius: 2 }} />
        </View>
      )}
      backgroundStyle={styles.sheetBackground}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={{ width: 24 }} />
          <Text weight="bold" color="primary" style={styles.sheetTitle}>
            {isEditing ? t.editTitle : t.createTitle}
          </Text>
          <BSTouch onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.sheetHandle} />
          </BSTouch>
        </View>

        {/* Name */}
        <Text weight="bold" color="primary" style={styles.label}>{t.nameLabel}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t.namePlaceholder}
          placeholderTextColor={Colors.placeholder}
          maxLength={40}
          returnKeyType="done"
        />

        {/* Type toggle — only when creating without a forced type */}
        {showTypeToggle && (
          <>
            <Text weight="bold" color="primary" style={styles.label}>{t.typeLabel}</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'e' && styles.typeBtnActive]}
                onPress={() => setType('e')}
              >
                <Text weight="bold" color={type === 'e' ? 'light' : 'primary'}>{t.typeExpense}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'i' && styles.typeBtnActive]}
                onPress={() => setType('i')}
              >
                <Text weight="bold" color={type === 'i' ? 'light' : 'primary'}>{t.typeIncome}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Icon picker */}
        <Text weight="bold" color="primary" style={styles.label}>{t.iconLabel}</Text>
        <View style={styles.iconGrid}>
          {iconRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.iconRow}>
              {row.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[styles.iconCell, icon === iconName && styles.iconCellSelected]}
                  onPress={() => setIcon(iconName)}
                >
                  <MaterialCommunityIcons
                    name={iconName}
                    size={24}
                    color={icon === iconName ? Colors.secondary : Colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, (!canSave || saving) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          <Text color="light" style={styles.saveTxt}>
            {saving ? t.saving : t.saveBtn}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.sheetBackground,
    borderWidth: 1,
    borderColor: Colors.sheetBorder,
    borderRadius: 40,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  sheetTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.white,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: 'Poppins-Light',
    fontSize: 15,
    borderWidth: 0.5,
    borderColor: Colors.sheetBorder,
    color: Colors.primary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sheetBorder,
    backgroundColor: Colors.white,
  },
  typeBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  iconGrid: {
    gap: 4,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  iconCell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.sheetBorder,
  },
  iconCellSelected: {
    borderColor: Colors.secondary,
    borderWidth: 2,
    backgroundColor: '#2706f914',
  },
  saveBtn: {
    marginTop: 28,
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: Colors.sheetHandle,
  },
  saveTxt: {
    textAlign: 'center',
  },
})
