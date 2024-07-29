const express = require("express");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const { extractData } = require("./utils/scrapeData");
const scrapeData = require("./utils/scrapeData");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  return res.status(200).send({
    message: "API is working, You are doing something wrong you fool",
    success: true,
  });
});
app.get("/scrap-data", async (req, res) => {
  const {
    query,
    offset = 1,
    num = 10,
    language = "en",
    location = "US",
  } = req.query;

  if (!query) {
    return res
      .status(400)
      .send({ error: "Query parameter is required", success: false });
  }
  if(num > 15){
    return res
    .status(400)
    .send({ error: "Number is too large, it can cause failure of this Call", success: false });
  }

  let allResults = new Set();
  const startTime = new Date();
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}&start=${(offset - 1) * num}&hl=${language}&gl=${location}&num=${num}`;
    console.log("url", url);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("a h3");

    const results = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a h3"));
      return anchors.map((anchor) => {
        const href = anchor.closest("a").href;
        const title = anchor.innerText;
        if (title && href) return { href, title };
      });
    });
    await browser.close();

    const detailedDataPromises = results.map(result => scrapeData(result.href));
    const allDetailedData = await Promise.all(detailedDataPromises);
    // Flatten the array of results
    const uniqueResults = allDetailedData.flat();

    return res.status(200).send({
      total: uniqueResults.length,
      results: uniqueResults,
      success: true,
      time: new Date()-startTime
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Something went wrong", success: false });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
