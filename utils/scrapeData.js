const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');

async function scrapeData(url) {
  const results = [];
  console.log('Page url', url)
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Customize the selector and data extraction logic based on the structure of the target page
    const data = await page?.evaluate(() => {
      // Example selector and extraction logic
      const title = document.querySelector('title') ? document.querySelector('title').innerText : 'No title';
      const paragraphs = document.body.innerText;
      return { title, paragraphs };
    });

    results.push({
      _id: uuidv4(),
      title: data.title,
      url: url,
      data: data.paragraphs,
    });

    await browser.close();
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }

  return results;
}

module.exports = scrapeData;
