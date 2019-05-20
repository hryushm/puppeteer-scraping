const puppeteer = require('puppeteer');
const logger = require('./logger');

class Screenshooter {
  constructor() {
    this.nextval = 1;
  }

  async shot(page) {
    await page.screenshot({ path: `./screenshot/shot${this.count()}.png` });
  }

  count() {
    const currentval = this.nextval;
    this.nextval += 1;
    return currentval;
  }
}

// Note that this runs on browser
function scrapingAvairableDate() {
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
    if (cells[0].children[0]) {
      const dateString = cells[0].children[0].innerHTML;
      for (let j = 1; j < cells.length; j += 1) {
        if (isAvailable(cells[j]) && (isHoliday(dateString) || isNightSlot(j))) {
          results.push(dateString + timePeriod[j]);
        }
      }
    }
  }
  return results;
}

class TennisCourtScraper {
  constructor(url) {
    this.screenshooter = new Screenshooter();
    this.pageUrl = url;
    this.message = '';
  }

  async init() {
    this.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
  }

  async run() {
    await this.getAvairableDate();
    if (this.availableDate.length > 0) {
      this.message = `利用可能な枠があります！\n${this.availableDate.join(
        '\n',
      )}\n予約はこちらから\n${this.pageUrl}`;
    } else {
      this.message = '利用可能な枠がなくなりました。。';
      logger('利用可能枠なし');
    }
  }

  async getAvairableDate() {
    this.page = await this.browser.newPage();
    try {
      await this.page.goto(this.pageUrl);

      await this.clickXpath('//*[@id="contents"]/ul[1]/li[2]/dl/dt/form/input[2]'); // Multi function
      await this.clickXpath('//*[@id="local-navigation"]/dd/ul/li[1]/a'); // Availability
      await this.select('#contents > form:nth-child(5) > div > div > div > div.left > div > div.left > select:nth-child(1)', '1005'); // open air sports facility
      await this.screenshooter.shot(this.page);
      await this.clickXpath('//*[@id="contents"]/form[1]/div/div/div/div[1]/div/div[1]/input[2]'); // Submit
      await this.select('#contents > form:nth-child(8) > div > div > div > div.left > div > div.left > select', '9'); // Select tennis
      await this.screenshooter.shot(this.page);
      await this.clickXpath('//*[@id="contents"]/form[4]/div/div/div/div[1]/div/div[1]/input[2]'); // Submit
      await this.clickXpath('//*[@id="contents"]/div[2]/form/div/div/div[1]/div/div[1]/select/option[1]'); // Okubo Sports Plaza
      await this.screenshooter.shot(this.page);
      await this.clickXpath('//*[@id="contents"]/div[2]/form/div/div/div[1]/div/div[1]/input[2]'); // Submit
      await this.clickXpath('//*[@id="contents"]/form[5]/div/div/div/select/option'); // Okubo Sports Plaza No.1 Court
      await this.screenshooter.shot(this.page);
      await this.clickXpath('//*[@id="contents"]/form[5]/div/div/div/p[2]/input[2]'); // Submit
      await this.clickXpath('//*[@id="btnOK"]'); // Search
      await this.screenshooter.shot(this.page);
      await this.clickXpath('//*[@id="contents"]/div[2]/div/div/ul[1]/li/a'); // Check more...
      await this.page.waitForXPath('//*[@id="contents"]/div[2]/div/div/div/ul[1]/li/a');
      await this.screenshooter.shot(this.page);

      this.availableDate = await this.page.evaluate(scrapingAvairableDate);
      const DATE_CAN_CHECK_NEXT_MONTH = 20;
      if (new Date().getDate() >= DATE_CAN_CHECK_NEXT_MONTH) {
        const nextMonthXPath = '//*[@id="contents"]/div[2]/div/ul/li[2]/a[3]';
        await this.clickXpath(nextMonthXPath);
        await this.page.waitForXPath(
          '//*[@id="contents"]/div[2]/div/ul/li[1]/a[1]',
        );
        this.availableDate = this.availableDate.concat(
          await this.page.evaluate(scrapingAvairableDate),
        );
      }
    } catch (error) {
      throw error;
    } finally {
      await this.browser.close();
    }
  }

  async select(selector, value) {
    await this.page.waitFor(selector);
    await this.page.select(selector, value);
  }

  async clickXpath(xpath) {
    await this.page.waitForXPath(xpath);
    const elementHandles = await this.page.$x(xpath);
    await elementHandles[0].click();
  }
}

module.exports = TennisCourtScraper;
