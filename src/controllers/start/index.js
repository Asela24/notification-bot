const { Scenes, Markup } = require("telegraf");
const { BaseScene } = Scenes;
const { User } = require("../../models/User");
const { formatDateToDDMMYY } = require("../../utils/get-date");

const readyKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("Погнали", "go-action"),
]);

const nicknameScene = new BaseScene("nicknameScene");
nicknameScene.enter(async (ctx) => {
  const uid = String(ctx.from.id);
  const user = await User.findById(uid);
  if (user) {
    const lastPaymentDate = user.lastPaymentDate;
    await ctx.reply(
      `Привет. C возвращением! \n${
        lastPaymentDate
          ? `Последняя оплата была произведена ${formatDateToDDMMYY(
              lastPaymentDate
            )}`
          : ""
      }`,
      readyKeyboard
    );
    ctx.scene.leave();
  } else {
    ctx.reply("Привет! Пожалуйста, введите свой ник от инстаграма:");
  }
});

nicknameScene.on("text", (ctx) => {
  const nickname = ctx.message.text;
  ctx.session.nickname = nickname;
  ctx.reply(`Спасибо! Теперь введите ваше имя и отчество:`);
  ctx.scene.enter("nameScene");
});

const nameScene = new BaseScene("nameScene");

nameScene.on("text", async (ctx) => {
  const name = ctx.message.text;
  ctx.session.name = name;
  const nickname = ctx.session.nickname;

  const newUser = new User({
    _id: String(ctx.from.id),
    name: name,
    instagram: nickname,
    telegram: ctx.from.id,
  });

  await newUser.save();
  ctx.scene.enter("selectPeopleNumberForPaymentScene");
});

selectPeopleNumberForPaymentScene = new BaseScene(
  "selectPeopleNumberForPaymentScene"
);

selectPeopleNumberForPaymentScene.enter((ctx) => {
  ctx.reply(
    "Пожалуйста выберите количество людей за которых будет происходить оплата",
    Markup.inlineKeyboard([
      [
        {
          text: 1,
          callback_data: "1",
        },
      ],
      [
        {
          text: 2,
          callback_data: "2",
        },
      ],
    ])
  );
});

selectPeopleNumberForPaymentScene.on("callback_query", async (ctx) => {
  const name = ctx.session.name;
  const nickname = ctx.session.nickname;

  console.log(ctx.update.callback_query.data);
  try {
    await User.updateOne(
      {
        _id: ctx.from.id,
      },
      {
        numberOfPeople: ctx.update.callback_query.data,
      }
    );

    ctx.reply(
      `Спасибо! Ваш инстаграм: ${nickname}, ваше имя: ${name}.`,
      readyKeyboard.resize()
    );

    ctx.scene.leave();
  } catch (e) {
    console.log(e);
  }
});

module.exports = {
  nameScene,
  nicknameScene,
  selectPeopleNumberForPaymentScene,
};
