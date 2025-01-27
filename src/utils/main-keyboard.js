const { Markup } = require("telegraf");

const mainKeyboard = Markup.keyboard([
  ["Оплатить", "Настройки", "Обратная связь", "Информация об оплате"],
]).resize();

module.exports = { mainKeyboard };
