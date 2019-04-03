const fetch = require('node-fetch');

module.exports = async (url, text) => {
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(error => console.err(error));
};
