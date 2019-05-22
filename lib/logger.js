module.exports = (text, type) => {
  const date = new Date();
  date.setTime(date.getTime() + 1000 * 60 * 60 * 9); // convert to JST
  if (type === 'error') {
    console.error(date, text);
  } else {
    console.log(date, text);
  }
};
