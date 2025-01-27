const { Scenes } = require("telegraf");
const { BaseScene } = Scenes;
const { paymentAction } = require("./actions");
const { months, periodKeyBoard } = require("./const");
const { telegramBot } = require("../../../bot-instance");

const selectPeriodScene = new BaseScene("selectPeriod");
selectPeriodScene.enter((ctx) => {
  ctx.reply("Выберите период", periodKeyBoard);
});

selectPeriodScene.action(Object.keys(months), (ctx) => {
  ctx.session.period = months[ctx.update.callback_query.data];
  ctx.scene.enter("getConfirmationPicture");
});

const getConfirmationPicture = new BaseScene("getConfirmationPicture");
getConfirmationPicture.enter((ctx) => {
  ctx.reply(
    "Для успешной оплаты - отправьте фотографию чека в чат. \nДанные для перевода - +79869316660, Тинькоф, Мухаметзянов Максим"
  );
});

getConfirmationPicture.on("document", async (ctx) => {
  await paymentAction({
    ctx,
    sendProof: async () => {
      await telegramBot.sendDocument(
        process.env.CHAT_ID_WITH_MAXIM,
        ctx.update.message.document.file_id
      );
    },
  });
});
getConfirmationPicture.on("photo", async (ctx) => {
  await paymentAction({
    ctx,
    sendProof: async () => {
      await telegramBot.sendPhoto(
        process.env.CHAT_ID_WITH_MAXIM,
        ctx.message.photo[0].file_id
      );
    },
  });
});

module.exports = { selectPeriodScene, getConfirmationPicture };
