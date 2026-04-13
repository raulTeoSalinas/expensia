import { View, StyleSheet } from 'react-native'
import Text from '@components/Text'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Colors from '../constants/colors'
import SyncStatusIcon from './SyncStatusIcon'

const Row = ({ description, value, icon, syncStatus }) => {
	return (
		<View style={styles.rows}>
			<View style={styles.moneyIcon}>
				<MaterialCommunityIcons name={icon} size={24} color={Colors.accent} />
				<Text color="light" size="m">{description}</Text>
				{syncStatus && <SyncStatusIcon syncStatus={syncStatus} />}
			</View>
			<Text weight="bold" color="light">{value}</Text>
		</View>
	)
}

export default Row

const styles = StyleSheet.create({
	rows: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 4
	},
	moneyIcon: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	}
})
