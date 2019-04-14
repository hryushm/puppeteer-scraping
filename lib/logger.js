module.exports = (text, type) => {
  const date = new Date();
  if (type === 'error') {
    console.error(date, text);
  } else {
    console.log(date, text);
  }
};
