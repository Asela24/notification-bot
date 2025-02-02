const shouldSetUpNotification = (nextPaymentDate) => {
  const currentDate = new Date();

  return nextPaymentDate > currentDate ? true : false;
};

module.exports = { shouldSetUpNotification };
