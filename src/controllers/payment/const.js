const { Markup } = require("telegraf");

const oneDayInMs = 24 * 60 * 60 * 1000;

const months = {
  "month-period": {
    label: "1 месяц",
    period: 1,
  },
  "2-month-period": {
    label: "2 месяца",
    period: 2,
  },
  "3-month-period": {
    label: "3 месяца",
    period: 3,
  },
};

const periodKeyBoard = Markup.inlineKeyboard(
    Object.entries(months).map((period) =>
      Markup.button.callback(period[1].label, period[0])
    )
  );

module.exports = { oneDayInMs, months, periodKeyBoard };
