const puppeteer = require('puppeteer');

async function select(page, selector, value) {
  await page.waitFor(selector);
  await page.select(selector, value); // Select tennis in "purpose"
}

async function clickXpath(page, xpath) {
  await page.waitForXPath(xpath);
  const elementHandles = await page.$x(xpath);
  await elementHandles[0].click();
}

async function scrapingAvairableDate() {
  const isAvailable = slot => slot.className === 'ok';
  const isHoliday = ds => /(土|日)/.test(ds);
  const isNightSlot = slotNum => slotNum === 6; // 19:30-22:00
  const getTimePeriod = (tr) => {
    const headers = tr.children;
    const timePeriod = [];
    for (let i = 0; i < headers.length; i += 1) {
      timePeriod.push(headers[i].innerText.replace(/\n/g, ''));
    }
    return timePeriod;
  };

  const rows = document.querySelectorAll('#contents table tr');
  const timePeriod = getTimePeriod(rows[0]);
  const results = [];
  for (let i = 1; i < rows.length; i += 1) {
    const { cells } = rows[i];
    const dateString = cells[0].children[0].innerHTML;
    for (let j = 1; j < cells.length; j += 1) {
      if (isAvailable(cells[j]) && (isHoliday(dateString) || isNightSlot(j))) {
        results.push(dateString + timePeriod[j]);
      }
    }
  }
  return results;
}

async function getAvairableDate() {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  let availableDate = [];
  try {
    const page = await browser.newPage();
    await page.goto('https://user.shinjuku-shisetsu-yoyaku.jp/regasu/reserve/gin_menu');

    await clickXpath(page, '//*[@id="contents"]/ul[1]/li[2]/dl/dt/form/input[2]'); // Multi function
    await clickXpath(page, '//*[@id="local-navigation"]/dd/ul/li[1]/a'); // Availability
    await select(page, '#contents > form:nth-child(5) > div > div > div > div.left > div > div.left > select:nth-child(1)', '1005'); // open air sports facility
    await clickXpath(page, '//*[@id="contents"]/form[1]/div/div/div/div[1]/div/div[1]/input[2]'); // Submit
    await select(page, '#contents > form:nth-child(8) > div > div > div > div.left > div > div.left > select', '9'); // Select tennis
    await clickXpath(page, '//*[@id="contents"]/form[4]/div/div/div/div[1]/div/div[1]/input[2]'); // Submit
    await clickXpath(page, '//*[@id="contents"]/div[2]/form/div/div/div[1]/div/div[1]/select/option[1]'); // Okubo Sports Plaza
    await clickXpath(page, '//*[@id="contents"]/div[2]/form/div/div/div[1]/div/div[1]/input[2]'); // Submit
    await clickXpath(page, '//*[@id="contents"]/form[5]/div/div/div/select/option'); // Okubo Sports Plaza No.1 Court
    await clickXpath(page, '//*[@id="contents"]/form[5]/div/div/div/p[2]/input[2]'); // Submit
    await clickXpath(page, '//*[@id="btnOK"]'); // Search
    await clickXpath(page, '//*[@id="contents"]/div[2]/div/div/ul[1]/li/a'); // Check more...
    await page.waitForXPath('//*[@id="contents"]/div[2]/div/div/div/ul[1]/li/a');

    availableDate = await page.evaluate(scrapingAvairableDate);
  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
  return availableDate;
}

module.exports = getAvairableDate;
