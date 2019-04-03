const notifySlack = require('./lib/notifySlack');
const getAvailableDate = require('./lib/getAvailableDate');

(async () => {
  const url = process.env.SLACK_URL;
  if (!url) {
    console.error('環境変数SLACK_URLがありません');
    process.exit(1);
  }
  const availableDate = await getAvailableDate();
  if (availableDate.length > 0) {
    const text = `利用可能な枠があります！\n${availableDate.join('\n')}`;
    try {
      await notifySlack(url, text);
    } catch (error) {
      console.err(error);
    }
  }
})();
