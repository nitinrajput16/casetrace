const puppeteer = require('puppeteer');

module.exports = async function generatePdf(html) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return buffer;
};
