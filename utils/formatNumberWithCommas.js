const formatNumberWithCommas = (number) => {
  // Convierte el número a un formato de cadena con 2 decimales
  const roundedNumber = Number(number).toFixed(2);
  const numberString = roundedNumber.toString();
  const isNegative = number < 0; // Verifica si el número es negativo
  const parts = numberString.split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] || "";

  // Elimina el signo negativo para el formateo
  if (isNegative) {
    integerPart = integerPart.slice(1); // Elimina el signo negativo
  }

  let formattedNumber = "";
  while (integerPart.length > 3) {
    formattedNumber = "," + integerPart.slice(-3) + formattedNumber;
    integerPart = integerPart.slice(0, integerPart.length - 3);
  }
  formattedNumber = integerPart + formattedNumber;

  if (decimalPart.length > 0) {
    formattedNumber += "." + decimalPart;
  }

  // Añade el signo negativo de nuevo si el número original era negativo
  if (isNegative) {
    formattedNumber = "-" + formattedNumber;
  }

  return formattedNumber;
};

export default formatNumberWithCommas;