// React / React-Native
import { useState, useEffect, useContext } from "react";
import {
	Platform,
	Text,
	StyleSheet,
	View,
	TouchableOpacity
} from "react-native";
// Third Party Libraries
import { Calendar, LocaleConfig } from 'react-native-calendars';
// Utils
import { calendarES, calendarEN, theme } from "../utils/calendarSettings";
import Colors from "../utils/colors";
import formatNumberWithCommas from "../utils/formatNumberWithCommas";
import getCurrentDate from "../utils/getCurrentDay";
import { es, en } from "../utils/languages";
// Components
import Row from "../components/Row";
import MonthSummary from "../components/MonthSummary";
import ScreenContainer from "../components/ScreenContainer";
import Header from "../components/Header";
import PieChartCategory from "../components/PieChartCategory";
// Context
import { ExpensiaContext } from "../context/expensiaContext";
// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
// AsyncStorage
import expensiaAsyncStorage from "../context/expensiaAsyncStorage";



const MainScreen = ({ navigation }) => {

	const { transactions, user, togglePrivacy } = useContext(ExpensiaContext);
	const { togglePrivacyAsyncStorage } = expensiaAsyncStorage;

	const strings = user && user.language === "en" ? en : es;

	const languageCalendar = user && user.language === "en" ? calendarEN : calendarES;

	const income = { key: 'income', color: Colors.secondary };
	const expense = { key: 'expense', color: Colors.accent };
	const loan = { key: 'loan', color: Colors.primary };

	const [groupedTransactions, setGroupedTransactions] = useState({});
	const [monthOnDisplay, setMonthOnDisplay] = useState(getCurrentDate().slice(0, 7));
	const [markedDates, setMarkedDates] = useState({});
	const [pieChartData, setPieChartData] = useState({});

	const [userDisplay, setUserDisplay] = useState(null)
	//Boolean State, used as a Key for Calendar Component. It helps to re-render Calendar component every time user change language.
	const [reRender, setReRender] = useState(false);

	useEffect(() => {
		const groupedTransactionsReduce = transactions.reduce((result, transaction) => {
			const { amount, type, date, category } = transaction;
			const parsedAmount = parseFloat(amount);
			const { id: categoryId } = category;

			if (date.startsWith(monthOnDisplay)) {
				const formattedDate = date; // format 'YYYY-MM-DD'

				setMarkedDates((prevMarkedDates) => {
					const updatedMarkedDates = { ...prevMarkedDates };

					if (!updatedMarkedDates.hasOwnProperty(formattedDate)) {
						updatedMarkedDates[formattedDate] = { dots: [] };
					}

					const existingDots = updatedMarkedDates[formattedDate].dots;

					switch (type) {
						case "i":
							result.monthIncome ? (result.monthIncome += parsedAmount) : (result.monthIncome = parsedAmount);
							result.typeI[categoryId] = (result.typeI[categoryId] || 0) + parsedAmount;
							if (!existingDots.some((dot) => dot.key === 'income')) {
								updatedMarkedDates[formattedDate].dots.push(income);
							}
							break;
						case "e":
							result.monthExpense ? (result.monthExpense += parsedAmount) : (result.monthExpense = parsedAmount);
							result.typeE[categoryId] = (result.typeE[categoryId] || 0) + parsedAmount;
							if (!existingDots.some((dot) => dot.key === 'expense')) {
								updatedMarkedDates[formattedDate].dots.push(expense);
							}
							break;
						case "l":
							result.monthExpense ? (result.monthExpense += parsedAmount) : (result.monthExpense = parsedAmount);
							result.typeL[categoryId] = (result.typeL[categoryId] || 0) + parsedAmount;
							if (!existingDots.some((dot) => dot.key === 'loan')) {
								updatedMarkedDates[formattedDate].dots.push(loan);
							}
							break;
						default:
							break;
					}

					return updatedMarkedDates;
				});
			}

			return result;
		}, { typeI: {}, typeE: {}, typeL: {} });
		if (transactions.length === 0) {
			setMarkedDates({})
		}
		setGroupedTransactions(groupedTransactionsReduce);
	}, [transactions, monthOnDisplay]);

	useEffect(() => {
		setUserDisplay(user)
		LocaleConfig.locales["default"] = languageCalendar;
		LocaleConfig.defaultLocale = 'default';
		setReRender(!reRender) //We change the boolean state to re-render Calendar component.
	}, [user])

	const handleHideTotals = () => {
		togglePrivacy();
		togglePrivacyAsyncStorage();
	}

	const handleTransfer = () => {
		navigation.navigate("Wallet")
	}

	const series = [123, 321, 123, 789, 537]
	const sliceColor = ['#fbd203', '#ffb300']

	return (
		<ScreenContainer>

			<Header darkText={strings.mainScreen.headerDarkTxt} gradientText={userDisplay && userDisplay.name} addBtn />

			<View style={styles.cardTotals}>
				{userDisplay && userDisplay.accounts.map((account, i) => (
					<Row key={i} description={`${strings.mainScreen.rowDescription}${account.name}:`} value={!userDisplay.privacy ? `$${formatNumberWithCommas(account.amount)}` : "•••••"} icon={account.icon} />
				))}
			</View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 30 }}>
				<TouchableOpacity onPress={handleTransfer} style={{ flexDirection: 'row', alignItems: 'center' }}>
					<MaterialCommunityIcons name="bank-transfer" size={28} color={Colors.secondary} />
					<Text style={{ fontFamily: 'poppins-bold' }}>{strings.mainScreen.transferBtn}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleHideTotals} style={{ flexDirection: 'row', alignItems: 'center' }}>
					<MaterialCommunityIcons name={userDisplay && !userDisplay.privacy ? "eye" : "eye-off"} size={24} color={Colors.secondary} />
					<Text style={{ fontFamily: 'poppins-bold' }}>{strings.mainScreen.hideBtn}</Text>
				</TouchableOpacity>
			</View>

			<MonthSummary income={groupedTransactions.monthIncome ? groupedTransactions.monthIncome : 0} expenses={groupedTransactions.monthExpense ? groupedTransactions.monthExpense : 0} />

			<Calendar
				key={reRender}
				onDayPress={(day) => {
					navigation.navigate("DayTransaction", { dateString: day.dateString });
				}}
				markingType={'multi-dot'}
				markedDates={markedDates}
				onMonthChange={date => {
					setMonthOnDisplay(date.dateString.slice(0, 7)), date;
				}}
				theme={theme}
			/>
			<View style={styles.markedContainer}>
				<View style={styles.containerLabelMarked}>
					<View style={[styles.squareMarked, { backgroundColor: Colors.secondary }]}></View>
					<Text style={styles.txtMarked}>{strings.transactionsScreen.selectTypeIncome}</Text>
				</View>
				<View style={styles.containerLabelMarked}>
					<View style={[styles.squareMarked, { backgroundColor: Colors.accent }]}></View>
					<Text style={styles.txtMarked}>{strings.transactionsScreen.selectTypeExpenses}</Text>
				</View>
				<View style={styles.containerLabelMarked}>
					<View style={[styles.squareMarked, { backgroundColor: Colors.primary }]}></View>
					<Text style={styles.txtMarked}>{strings.transactionsScreen.selectTypeLoans}</Text>
				</View>
			</View>
			<View style={styles.pieChartContainer}>
				{groupedTransactions.typeE && Object.values(groupedTransactions.typeE).length > 0 &&
					<PieChartCategory type="e" data={groupedTransactions.typeE} />
				}
				{groupedTransactions.typeI && Object.values(groupedTransactions.typeI).length > 0 &&
					<PieChartCategory data={groupedTransactions.typeI} />
				}
			</View>
		</ScreenContainer>
	);
}

export default MainScreen;

const styles = StyleSheet.create({

	cardTotals: {

		marginHorizontal: 20,
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderRadius: 20,
		backgroundColor: Colors.primary,
		borderColor: 'white',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.2,
		shadowRadius: 7.49,

		elevation: 12,
	},
	welcome: {
		fontSize: 25,
		marginTop: Platform.OS === 'ios' ? 0 : 40,
		fontFamily: 'poppins-bold',
		color: Colors.primary
	},
	buttonIcon: {
		resizeMode: 'contain',
		width: 50,
		height: 50,
	},
	opacity: {
		width: 60,
		height: 60,
		marginTop: Platform.OS === 'ios' ? 0 : 30,
	},
	markedContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: "2%",
		marginBottom: '5%',

	},
	txtMarked: {
		fontFamily: 'poppins',
		color: Colors.primary
	},
	containerLabelMarked: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	squareMarked: {
		width: 6,
		height: 6,
		borderRadius: 2,
		marginRight: "5%"
	},
	pieChartContainer: {
		marginBottom: "5%"
	}

})