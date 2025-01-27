const { Telegraf, session, Telegram } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN, {});
const telegramBot = new Telegram(process.env.BOT_TOKEN, {});

module.exports = { bot, telegramBot };
