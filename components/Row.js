// React / React-Native
import { View, Text, StyleSheet } from "react-native";
// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Utils
import Colors from "../utils/colors";

const Row = ({ description, value, icon }) => {

	return (
		<View style={styles.rows}>
			<Text style={styles.text}>{description}</Text>
			<View style={styles.moneyIcon}>
				<Text style={styles.textBold}>{value}</Text>
				<MaterialCommunityIcons name={icon} size={24} color={Colors.accent} />
			</View>
		</View>
	);
}

export default Row;

const styles = StyleSheet.create({
	rows: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: 'center',
		marginVertical: 4
	},
	text: {
		fontFamily: 'Poppins-Light',
		color: Colors.light,
		fontSize: 14
	},
	textBold: {
		fontFamily: 'Poppins-SemiBold',
		color: Colors.light,
		marginRight: 10
	},
	moneyIcon: {
		flexDirection: 'row',
		alignItems: 'center',
	}
});