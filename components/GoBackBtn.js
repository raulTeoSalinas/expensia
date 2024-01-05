// React / React-Native
import { TouchableOpacity } from "react-native";
// Icons
import { Ionicons } from '@expo/vector-icons';
// Navigation
import { useNavigation } from "@react-navigation/native";
// Utils
import Colors from "../utils/colors";

const GoBackBtn = () => {
    
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={navigation.goBack}>
            <Ionicons name="caret-back" size={24} color={Colors.primary} />
        </TouchableOpacity >
    )

}

export default GoBackBtn;