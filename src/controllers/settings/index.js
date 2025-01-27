const { BaseScene } = require("telegraf/scenes");
const { Markup } = require("telegraf");
const { mainKeyboard } = require("../../utils/main-keyboard");
const { getUser } = require("../../utils/get-user");
const { updateUser } = require("../../utils/update-user");
//TODO: complete notifications

const userInfo = new BaseScene("userInfo");

userInfo.enter(async (ctx) => {
  const userInfo = await getUser(ctx.from.id);

  if (userInfo) {
    ctx.reply(
      `Ваши данные:\nИмя: ${userInfo.name} \nInstagram: ${userInfo.instagram}`,
      Markup.inlineKeyboard([
        [{ text: "Редактировать имя", callback_data: "edit_name" }],
        [{ text: "Редактировать instagram", callback_data: "edit_instagram" }],
        [
          {
            text: "Изменить количество людей",
            callback_data: "edit_people_number",
          },
        ],
      ])
    );
  }
});

userInfo.on("callback_query", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;

  if (callbackData === "edit_name") {
    ctx.scene.enter("editName");
  }

  if (callbackData === "edit_instagram") {
    ctx.scene.enter("editInstagram");
  }

  if (callbackData === "edit_people_number") {
    ctx.scene.enter("editPeopleNumber");
  }
});

const editPeopleNumber = new BaseScene("editPeopleNumber");
editPeopleNumber.enter((ctx) => {
  ctx.reply(
    "Выберите количество людей",
    Markup.keyboard([["Назад", "1", "2"]]).resize()
  );
});

editPeopleNumber.hears(["1", "2"], async (ctx) => {
  await updateUser({
    id: ctx.from.id,
    ctx,
    body: {
      numberOfPeople: ctx.update.message.text,
    },
    onError: () => {
      ctx.reply("Произошла ошибка. Попробуйте снова", mainKeyboard);
      ctx.scene.leave();
    },
    onSuccess: () => {
      ctx.reply(
        "Спасибо. Количество людей было успешно обновлено.",
        mainKeyboard
      );
      ctx.scene.leave();
    },
  });
});

editPeopleNumber.hears("Назад", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Выберите следующее действие", mainKeyboard);
});

const editName = new BaseScene("editName");
editName.enter(async (ctx) => {
  ctx.reply("Введите новое имя", Markup.keyboard([["Назад", "fds"]]).resize());
});

editName.hears("Назад", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Выберите следующее действие", mainKeyboard);
});

editName.hears(/.*/, async (ctx) => {
  await updateUser({
    id: ctx.from.id,
    ctx,
    body: {
      name: ctx.message.text,
    },
    onSuccess: () => {
      ctx.reply("Спасибо. Ваше имя было обновлено", mainKeyboard);
      ctx.scene.leave();
    },
    onError: () => {
      ctx.reply("Произошла ошибка. Попробуйте снова", mainKeyboard);
      ctx.scene.leave();
    },
  });
});

const editInstagram = new BaseScene("editInstagram");
editInstagram.enter(async (ctx) => {
  ctx.reply("Введите новый ник", Markup.keyboard(["Назад"]).resize());
});

editInstagram.hears("Назад", (ctx) => {
  ctx.scene.leave();
  ctx.reply("Выберите следующее действие", mainKeyboard);
});

editInstagram.on("text", async (ctx) => {
  await updateUser({
    id: ctx.from.id,
    ctx,
    body: {
      instagram: ctx.message.text,
    },
    onError: () => {
      ctx.reply("Произошла ошибка. Попробуйте снова", mainKeyboard);
      ctx.scene.leave();
    },
    onSuccess: () => {
      ctx.reply("Спасибо. Ваше ник был обновлен", mainKeyboard);
      ctx.scene.leave();
    },
  });
});

module.exports = { userInfo, editName, editInstagram, editPeopleNumber };
