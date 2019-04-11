const notifySlack = require('./lib/notifySlack');
const getAvailableDate = require('./lib/getAvailableDate');
const StateSaver = require('./lib/StateSaver');

const reserveUrl = 'https://user.shinjuku-shisetsu-yoyaku.jp/regasu/reserve/gin_menu';

(async () => {
  const date = new Date();
  const url = process.env.SLACK_URL;
  let text = '';
  let shouldNotify = true;
  if (!url) {
    console.error('環境変数SLACK_URLがありません');
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
      console.log(date, 'no available court');
    }
  } catch (error) {
    console.log(error);
    text = '処理に失敗しました。。';
  } finally {
    if (shouldNotify) {
      console.log('=== notify slack message ===');
      console.log(date);
      console.log(text);
      await notifySlack(url, text);
    }
  }
})();
