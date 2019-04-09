const notifySlack = require('./lib/notifySlack');
const getAvailableDate = require('./lib/getAvailableDate');

const reserveUrl = 'https://user.shinjuku-shisetsu-yoyaku.jp/regasu/reserve/gin_menu';

(async () => {
  const date = new Date();
  const url = process.env.SLACK_URL;
  if (!url) {
    console.error('環境変数SLACK_URLがありません');
    process.exit(1);
  }
  try {
    const availableDate = await getAvailableDate();
    if (availableDate.length > 0) {
      const text = `利用可能な枠があります！\n${availableDate.join('\n')}\n予約はこちらから\n${reserveUrl}`;
      await notifySlack(url, text);
      console.log(date, text);
    } else {
      console.log(date, 'no available court');
    }
  } catch (error) {
    console.log('処理に失敗しました。。');
    console.log(error);
    process.exit(1);
  }
})();
