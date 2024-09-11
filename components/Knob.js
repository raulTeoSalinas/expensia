import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Colors from "../utils/colors";

const Knob = ({ isActive, onPress }) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: isActive ? Colors.secondary : '#d3d3d3', // Cambia los colores según tu tema
                    alignItems: isActive ? 'flex-end' : 'flex-start'
                }
            ]}
            onPress={onPress}
        >
            <View style={styles.circle} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        height: 20,
        width: 34,
        borderRadius: 10,
        padding: 1,
    },
    circle: {
        backgroundColor: '#ffffff', // Cambia el color según tu tema
        height: 18,
        width: 18,
        borderRadius: 9,
    }
});

export default Knob;