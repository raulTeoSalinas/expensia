import { useState, useContext, useCallback } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import Text from '@components/Text'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { calendarES, calendarEN, theme } from '../utils/calendarSettings'
import Colors from '../constants/colors'
import formatNumberWithCommas from '../utils/formatNumberWithCommas'
import getCurrentDate from '../utils/getCurrentDay'
import { es, en } from '../utils/languages'
import Row from '../components/Row'
import MonthSummary from '../components/MonthSummary'
import ScreenContainer from '../components/ScreenContainer'
import Header from '../components/Header'
import PieChartCategory from '../components/PieChartCategory'
import MonthYearPickerModal from '../components/MonthYearPickerModal'
import CalendarTappableMonthTitle from '../components/CalendarTappableMonthTitle'
import { ExpensiaContext } from '../context/expensiaContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useMonthYearPicker } from '@hooks/useMonthYearPicker'
import {
  useAccounts,
  useMonthSummary,
  useCalendarDots,
  useMonthCategoryBreakdown,
} from '../hooks/queries'

const MainScreen = ({ navigation }) => {
  const { user, togglePrivacy } = useContext(ExpensiaContext)
  const strings = user?.language === 'en' ? en : es
  const languageCalendar = user?.language === 'en' ? calendarEN : calendarES

  const [monthOnDisplay, setMonthOnDisplay] = useState(getCurrentDate().slice(0, 7))
  const [calendarLocaleKey, setCalendarLocaleKey] = useState(0)

  // Queries
  const { data: accounts = [] } = useAccounts()
  const { data: summary = { income: 0, expenses: 0 } } = useMonthSummary(monthOnDisplay)
  const { data: markedDates = {} } = useCalendarDots(monthOnDisplay)
  const { data: breakdown = { typeI: {}, typeE: {} } } = useMonthCategoryBreakdown(monthOnDisplay)

  // Month picker
  const handleMonthYearPicked = useCallback(({ year, month }) => {
    const m = String(month).padStart(2, '0')
    setMonthOnDisplay(`${year}-${m}`)
  }, [])

  const {
    monthPickerVisible,
    calendarRemountKey,
    pickerAnchor,
    openMonthYearPicker,
    confirmMonthYear,
    closeMonthPicker,
  } = useMonthYearPicker({
    getInitialAnchor: () => {
      const d = getCurrentDate()
      return { year: parseInt(d.slice(0, 4), 10), month: parseInt(d.slice(5, 7), 10) }
    },
    onConfirm: handleMonthYearPicked,
  })

  // Update calendar locale when language changes
  LocaleConfig.locales['default'] = languageCalendar
  LocaleConfig.defaultLocale = 'default'

  const calendarRenderHeader = useCallback(
    (monthXDate) => (
      <CalendarTappableMonthTitle
        month={monthXDate}
        onPress={openMonthYearPicker}
        accessibilityLabel={strings.monthYearPicker.title}
      />
    ),
    [openMonthYearPicker, strings.monthYearPicker.title]
  )

  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.isCC && !b.isCC) return 1
    if (!a.isCC && b.isCC) return -1
    return 0
  })

  return (
    <ScreenContainer>
      <Header darkText={strings.mainScreen.headerDarkTxt} gradientText={user?.name} addBtn />

      <View style={styles.cardTotals}>
        {sortedAccounts.map(account => (
          <Row
            key={account.id}
            description={account.name}
            value={!user?.isPrivacyEnabled ? `$${formatNumberWithCommas(account.amount)}` : '•••••'}
            icon={account.icon}
            syncStatus={account.syncStatus}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 30 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="bank-transfer" size={28} color={Colors.secondary} />
          <Text weight="bold">{strings.mainScreen.transferBtn}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePrivacy} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name={!user?.isPrivacyEnabled ? 'eye' : 'eye-off'} size={24} color={Colors.secondary} />
          <Text weight="bold">{strings.mainScreen.hideBtn}</Text>
        </TouchableOpacity>
      </View>

      <MonthSummary income={summary.income} expenses={summary.expenses} />

      <Calendar
        key={`${user?.language}-${calendarRemountKey}`}
        current={`${monthOnDisplay}-01`}
        monthFormat="MMMM yyyy"
        renderHeader={calendarRenderHeader}
        onDayPress={day => navigation.navigate('DayTransaction', { dateString: day.dateString })}
        markingType="multi-dot"
        markedDates={markedDates}
        onMonthChange={date => setMonthOnDisplay(date.dateString.slice(0, 7))}
        theme={theme}
      />

      <MonthYearPickerModal
        visible={monthPickerVisible}
        onRequestClose={closeMonthPicker}
        onConfirm={confirmMonthYear}
        monthNames={languageCalendar.monthNames}
        initialYear={pickerAnchor.year}
        initialMonth={pickerAnchor.month}
      />

      <View style={styles.markedContainer}>
        <View style={styles.containerLabelMarked}>
          <View style={[styles.squareMarked, { backgroundColor: Colors.secondary }]} />
          <Text color="primary">{strings.transactionsScreen.selectTypeIncome}</Text>
        </View>
        <View style={styles.containerLabelMarked}>
          <View style={[styles.squareMarked, { backgroundColor: Colors.accent }]} />
          <Text color="primary">{strings.transactionsScreen.selectTypeExpenses}</Text>
        </View>
      </View>

      <View style={styles.pieChartContainer}>
        {Object.values(breakdown.typeE).length > 0 &&
          <PieChartCategory type="e" data={breakdown.typeE} />
        }
        {Object.values(breakdown.typeI).length > 0 &&
          <PieChartCategory data={breakdown.typeI} />
        }
      </View>
    </ScreenContainer>
  )
}

export default MainScreen

const styles = StyleSheet.create({
  cardTotals: {
    marginHorizontal: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    borderColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7.49,
    elevation: 12,
  },
  markedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: '2%',
    marginBottom: '5%',
  },
  containerLabelMarked: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  squareMarked: {
    width: 6,
    height: 6,
    borderRadius: 2,
    marginRight: '5%'
  },
  pieChartContainer: {
    marginBottom: '5%'
  }
})
