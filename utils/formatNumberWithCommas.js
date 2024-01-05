const formatNumberWithCommas = (number) => {
    const roundedNumber = Number(number).toFixed(2);
    const numberString = roundedNumber.toString();
    const parts = numberString.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1] || "";
  
    let formattedNumber = "";
    while (integerPart.length > 3) {
      formattedNumber = "," + integerPart.slice(-3) + formattedNumber;
      integerPart = integerPart.slice(0, integerPart.length - 3);
    }
    formattedNumber = integerPart + formattedNumber;
  
    if (decimalPart.length > 0) {
      formattedNumber += "." + decimalPart;
    }
  
    return formattedNumber;
  };
  
  export default formatNumberWithCommas;