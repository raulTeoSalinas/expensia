// Utils
import Colors from "../constants/colors";

export const calendarES = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: "Hoy"
};

export const calendarEN = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: "Today"
};

export const theme = {
  backgroundColor: Colors.white,
  calendarBackground: Colors.white,
  textSectionTitleColor: Colors.secondary,
  textSectionTitleDisabledColor: Colors.calendarDisabled,
  selectedDayBackgroundColor: Colors.secondary,
  selectedDayTextColor: Colors.white,
  todayTextColor: Colors.secondary,
  dayTextColor: Colors.calendarDayText,
  textDisabledColor: Colors.calendarDisabled,
  dotColor: Colors.calendarDot,
  selectedDotColor: Colors.white,
  arrowColor: Colors.accent,
  disabledArrowColor: Colors.calendarDisabled,
  monthTextColor: Colors.primary,
  indicatorColor: Colors.calendarIndicator,
  textDayFontFamily: 'Poppins-Light',
  textMonthFontFamily: 'Poppins-SemiBold',
  textDayHeaderFontFamily: 'Poppins-Light',
  textDayFontSize: 16,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 16,
  dotStyle: { width: 6, height: 6 },
}


