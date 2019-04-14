module.exports = (text, type) => {
  if (type === 'error') {
    console.error(text);
  } else {
    console.log(text);
  }
};
