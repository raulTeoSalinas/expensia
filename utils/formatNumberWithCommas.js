const formatNumberWithCommas = (number) => {
  // Format number as string with 2 decimal places
  const roundedNumber = Number(number).toFixed(2);
  const numberString = roundedNumber.toString();
  const isNegative = number < 0; // Track negative for sign re-application
  const parts = numberString.split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] || "";

  // Strip minus for comma grouping
  if (isNegative) {
    integerPart = integerPart.slice(1); // Remove leading minus
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

  // Restore minus if original value was negative
  if (isNegative) {
    formattedNumber = "-" + formattedNumber;
  }

  return formattedNumber;
};

export default formatNumberWithCommas;