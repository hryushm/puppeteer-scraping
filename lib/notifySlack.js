const fetch = require('node-fetch');
const logger = require('./logger');

module.exports = async (text) => {
  const url = process.env.SLACK_URL;
  const skipNotify = !!process.env.SKIP_NOTIFY;
  if (!url) {
    logger('Missing SLACK_URL');
    process.exit(1);
  }
  logger('=== ▼ notify slack message ▼ ===');
  logger(text);
  logger('=== ▲ notify slack message ▲ ===');
  if (skipNotify) {
    logger('Skip notify');
  } else {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(error => console.err(error));
  }
};
