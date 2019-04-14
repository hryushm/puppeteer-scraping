const notifySlack = require('./lib/notifySlack');
const getAvailableDate = require('./lib/getAvailableDate');
const StateSaver = require('./lib/StateSaver');
const logger = require('./lib/logger');

const reserveUrl = 'https://user.shinjuku-shisetsu-yoyaku.jp/regasu/reserve/gin_menu';

(async () => {
  const date = new Date();
  const url = process.env.SLACK_URL;
  let text = '';
  let shouldNotify = true;
  if (!url) {
    logger('環境変数SLACK_URLがありません');
    process.exit(1);
  }
  try {
    const availableDate = await getAvailableDate();
    const stateSaver = new StateSaver('./state.json');
    const isSameState = stateSaver.isSameState(availableDate);
    stateSaver.saveState(availableDate);
    if (!isSameState) {
      if (availableDate.length > 0) {
        text = `利用可能な枠があります！\n${availableDate.join(
          '\n',
        )}\n予約はこちらから\n${reserveUrl}`;
      } else {
        text = '利用可能な枠がなくなりました。。';
      }
    } else {
      shouldNotify = false;
      logger(date, 'no available court');
    }
  } catch (error) {
    logger(error);
    text = '処理に失敗しました。。';
  } finally {
    if (shouldNotify) {
      logger('=== notify slack message ===');
      logger(date);
      logger(text);
      await notifySlack(url, text);
    }
  }
})();
