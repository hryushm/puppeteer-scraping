const notifySlack = require('./lib/notifySlack');
const TennisCourtScraper = require('./lib/getAvailableDate');
const StateSaver = require('./lib/StateSaver');
const logger = require('./lib/logger');

const reserveUrl = 'https://user.shinjuku-shisetsu-yoyaku.jp/regasu/reserve/gin_menu';

(async () => {
  let text = '';
  let shouldNotify = true;
  try {
    const scraper = new TennisCourtScraper(reserveUrl);
    const stateSaver = new StateSaver('./state.json');
    await scraper.init();
    await scraper.run();
    text = scraper.message;
    shouldNotify = !stateSaver.isSameState(scraper.availableDate);
    stateSaver.saveState(scraper.availableDate);
  } catch (error) {
    logger(error);
    text = 'Process Failed. Check log for detail';
  } finally {
    if (shouldNotify) {
      await notifySlack(text);
    } else {
      logger('Nothing to notify.');
    }
  }
})();
