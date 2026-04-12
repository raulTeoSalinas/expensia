// React / React-Native
import { View, StyleSheet } from "react-native";
import Text from '@components/Text';
// Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Utils
import Colors from "../constants/colors";

const Row = ({ description, value, icon }) => {

	return (
		<View style={styles.rows}>
			<Text color="light" size="m">{description}</Text>
			<View style={styles.moneyIcon}>
				<Text weight="bold" color="light" style={styles.textBold}>{value}</Text>
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
	textBold: {
		marginRight: 10
	},
	moneyIcon: {
		flexDirection: 'row',
		alignItems: 'center',
	}
});