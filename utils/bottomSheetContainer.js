import { Platform } from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'

const containerComponent = Platform.OS === 'ios'
    ? (props) => <FullWindowOverlay>{props.children}</FullWindowOverlay>
    : undefined

export default containerComponent
