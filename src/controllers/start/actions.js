const { User } = require("../../models/User");
const { shouldSetUpNotification } = require("./helpers");
const { telegramBot } = require("../../../bot-instance");
const { setUpNotification } = require("../payment/helpers");

const setupNotificationOnStartAction = async () => {
  const users = await User.find({});

  users.forEach(async (user) => {
    if (user.nextPaymentDate) {
      const isNotificationActive = shouldSetUpNotification(
        user.nextPaymentDate
      );

      if (isNotificationActive) {
        setUpNotification({
          nextPaymentDate: user.nextPaymentDate,
          text: "Подошел срок оплаты. Пожалуйста выберите период за который хотите произвести оплату",
          chatId: user.telegram,
          userId: user.telegram
        });
      }
    }
  });
};

module.exports = { setupNotificationOnStartAction };
