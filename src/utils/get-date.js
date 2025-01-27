const getDateOfNextPayment = (period) => {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + period);

  return currentDate;
};

const formatDateToDDMMYY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};

module.exports = { getDateOfNextPayment, formatDateToDDMMYY };
