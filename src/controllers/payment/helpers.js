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
  const nextPaymentTime = nextPaymentDate - new Date();

  setTimeout(async () => {
    await User.updateOne(
      {
        _id: userId,
      },
      {
        isPeriodPaid: false,
      }
    );
    telegramBot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Оплатить", callback_data: "payment_button_clicked" }],
        ],
      },
    });
    setUpDailyReminder({ id: userId, chatId: chatId });
  }, nextPaymentTime); // use next PaymentTime
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
