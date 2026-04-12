// React / React-Native
import { TouchableOpacity, StyleSheet } from "react-native";
import Text from "@components/Text";
import Colors from "../constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * Encabezado del mes para `renderHeader` de react-native-calendars (instancia XDate).
 */
const CalendarTappableMonthTitle = ({
    month,
    onPress,
    accessibilityLabel,
    showChevron = true,
}) => (
    <TouchableOpacity
        onPress={() => onPress(month)}
        activeOpacity={0.65}
        style={styles.wrap}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
    >
        <Text weight="bold" color="primary" style={styles.titleText}>
            {month.toString("MMMM yyyy")}
        </Text>
        {showChevron ? (
            <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.primary} />
        ) : null}
    </TouchableOpacity>
);

export default CalendarTappableMonthTitle;

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        marginHorizontal: 4,
        gap: 4,
    },
    titleText: {
        fontSize: 16,
    },
});
