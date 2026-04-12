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
			<View style={styles.moneyIcon}>
				<MaterialCommunityIcons name={icon} size={24} color={Colors.accent} />
				<Text color="light" size="m">{description}</Text>
			</View>
			<Text weight="bold" color="light">{value}</Text>
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
	moneyIcon: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	}
});