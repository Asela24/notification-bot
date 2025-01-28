const { setUpNotification } = require("./helpers");
const { Scenes, Markup, Telegram } = require("telegraf");
const {
  getDateOfNextPayment,
  formatDateToDDMMYY,
} = require("../../utils/get-date");
const { getResultInfo } = require("./helpers");
const { updateUser } = require("../../utils/update-user");
const { telegramBot } = require("../../../bot-instance");

const paymentAction = async ({ ctx, sendProof }) => {
  const nextPaymentDate = getDateOfNextPayment(ctx.session.period.period);

  await updateUser({
    id: ctx.from.id,
    body: {
      isPeriodPaid: true,
      lastPaymentDate: new Date(),
      nextPaymentDate: nextPaymentDate,
      paymentPeriod: ctx.session.period.period,
    },
    ctx,
    onError: () => {
      ctx.reply("Произошла ошибка. Попробуйте еще раз.");
      ctx.scene.leave();
    },
    onSuccess: async () => {
      const result = await getResultInfo(ctx);

      await telegramBot.sendMessage(process.env.CHAT_ID_WITH_MAXIM, result);
      await sendProof();

      ctx.reply(
        `Спасибо за оплату. Время след оплаты - ${formatDateToDDMMYY(
          nextPaymentDate
        )}. В день оплаты вам придет напоминание.`
      );
      setUpNotification({
        nextPaymentDate: nextPaymentDate,
        chatId: ctx.chat.id,
        text: "Подошел срок оплаты. Пожалуйста выберите период за который хотите произвести оплату",
        userId: ctx.message.from.username,
      });
    },
  });
};

module.exports = { paymentAction };
