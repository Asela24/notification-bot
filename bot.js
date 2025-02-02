require("dotenv").config();
require("./src/models/User");
const { mongoose } = require("mongoose");
const { session, Telegraf } = require("telegraf");
const {
  nameScene,
  nicknameScene,
  selectPeopleNumberForPaymentScene,
} = require("./src/controllers/start/index");
const {
  selectPeriodScene,
  getConfirmationPicture,
} = require("./src/controllers/payment/index");
const { Stage } = require("telegraf/scenes");
const {
  userInfo,
  editName,
  editInstagram,
  editPeopleNumber,
} = require("./src/controllers/settings");
const { getUser } = require("./src/utils/get-user");
const { formatDateToDDMMYY } = require("./src/utils/get-date");
const { mainKeyboard } = require("./src/utils/main-keyboard");
const { setupNotificationOnStartAction } = require('./src/controllers/start/actions')

const uri = process.env.DATABASE_URL;

console.log(uri);
mongoose.connect(uri);

mongoose.connection.on("error", (err) => {
  console.log(err);
  process.exit(1);
});

mongoose.connection.on("open", () => {
  const bot = new Telegraf(process.env.BOT_TOKEN, {});
  const stage = new Stage([
    nameScene,
    nicknameScene,
    selectPeriodScene,
    getConfirmationPicture,
    userInfo,
    editName,
    editInstagram,
    selectPeopleNumberForPaymentScene,
    editPeopleNumber,
  ]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    if (!ctx.session.nickname) {
      ctx.scene.enter("nicknameScene");
    } else if (!ctx.session.name) {
      ctx.scene.enter("nameScene");
    }
  });

  bot.action("go-action", async (ctx) => {
    await ctx.reply("Что нужно сделать", mainKeyboard);
  });

  bot.hears("Оплатить", (ctx) => {
    ctx.scene.enter("selectPeriod");
  });

  bot.hears("Настройки", (ctx) => {
    ctx.scene.enter("userInfo");
  });

  bot.hears("Информация об оплате", async (ctx) => {
    try {
      const userInfo = await getUser(ctx.from.id);
      if (!userInfo.lastPaymentDate) {
        ctx.reply(
          `Данные о предыдущей оплате отсуствуют.\nВыбрана опция оплаты за ${
            userInfo.numberOfPeople === 1
              ? "1 человека"
              : `${userInfo.numberOfPeople} людей`
          }`
        );
      } else {
        ctx.reply(
          `Последняя оплата была произведена: ${formatDateToDDMMYY(
            userInfo.lastPaymentDate
          )}\nСледующая оплата: ${formatDateToDDMMYY(
            userInfo.nextPaymentDate
          )}\nВыбрана опция оплаты за ${
            userInfo.numberOfPeople === 1
              ? "1 человека"
              : `${userInfo.numberOfPeople} людей`
          }`
        );
      }
    } catch (e) {
      ctx.reply("Произошла ошибка. Попробуйте снова");
      console.log(e);
    }
  });

  bot.hears("Обратная связь", (ctx) => {
    ctx.reply("По всем вопросам и проблемам, смело пишите @Maksim99745");
  });

  bot.launch(async () => {
    setupNotificationOnStartAction()
  });

  bot.on("callback_query", (ctx) => {
    if (ctx.callbackQuery.data === "payment_button_clicked") {
      ctx.scene.enter("selectPeriod");
    }
  });

  console.log("Бот запущен!");
});

module.exports = { mongoose };
