const { getUser } = require("../../utils/get-user");
const { oneDayInMs } = require("./const");
const { User } = require("../../models/User");
const { telegramBot } = require("../../../bot-instance");

const getResultInfo = async (ctx) => {
  const user = await getUser(ctx.from.id);

  return [
    `Имя: ${user.name}`,
    `Instagram: ${user.instagram}`,
    `Период: ${user.paymentPeriod}`,
    `Telegram: ${ctx.message.from.username}`,
    `Дата оплаты: ${user.lastPaymentDate}`,
    `Следующая оплата: ${user.nextPaymentDate}`,
    `Количество людей за которых оплачено: ${user.numberOfPeople}`,
  ].join("\n");
};

const setUpNotification = ({ nextPaymentDate, chatId, text, userId }) => {
  const nextPaymentTime = nextPaymentDate.getTime() - new Date().getTime();
  const MAX_TIMEOUT = 2147483647;

  if (nextPaymentTime <= 0) {
    console.error("Error: nextPaymentDate must be in the future!");
    return;
  }

  const scheduleNotification = (delay) => {
    if (delay > MAX_TIMEOUT) {
      console.log("Delay too long, scheduling intermediate timeout...");
      setTimeout(() => scheduleNotification(delay - MAX_TIMEOUT), MAX_TIMEOUT);
    } else {
      setTimeout(async () => {
        await User.updateOne({ _id: userId }, { isPeriodPaid: false });

        telegramBot.sendMessage(chatId, text, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Оплатить", callback_data: "payment_button_clicked" }],
            ],
          },
        });

        setUpDailyReminder({ id: userId, chatId });
      }, delay);
    }
  };

  scheduleNotification(nextPaymentTime);
};

const setUpDailyReminder = async ({ id, chatId }) => {
  setTimeout(async () => {
    const isPeriodPaid = await User.findById(id).isPeriodPaid;
    if (isPeriodPaid) {
      return;
    }
    telegramBot.sendMessage(chatId, "Пожалуйста, произведите оплату");

    setUpDailyReminder({ id, chatId });
  }, oneDayInMs); // use oneDayInMs
};

module.exports = { getResultInfo, setUpNotification };
