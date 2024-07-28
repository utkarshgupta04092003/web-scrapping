const puppeteer = require("puppeteer");

(async () => {
  const query = "i phone 15";
  let allResults = new Set();
  const offset = 1

    console.log("offset no", offset);
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&start=${(offset - 1) * 10}`;
    console.log("url", url);

    // Launch the browser in headless mode
    const browser = await puppeteer.launch({ headless: true }); // Set headless: true to run in headless mode
    // Open a new page
    const page = await browser.newPage();

    // Navigate to the Google search page
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for the results to load
    await page.waitForSelector("a h3");

    // Extract data from the search results
    const results = await page.evaluate(() => {
      // Select all anchor tags with h3 children (search result titles)
      const anchors = Array.from(document.querySelectorAll("a h3"));
      return anchors.map((anchor) => {
        const href = anchor.closest("a").href; // Get the href attribute of the closest anchor tag
        const h3Text = anchor.innerText; // Get the inner text of the h3 tag
        return { href, h3Text };
      });
    });

    // Add results to the Set to ensure uniqueness
    results.forEach(result => allResults.add(JSON.stringify(result)));

    // Close the browser
    await browser.close();
  

  // Convert the Set back to an array of unique results
  const uniqueResults = Array.from(allResults).map(item => JSON.parse(item));

  // Log the total count of unique results
  console.log("Total unique results:", uniqueResults.length);
  console.log(uniqueResults);
})();



// const puppeteer = require("puppeteer");

// (async () => {
//   const query = "i phone 15";
//   var offset = 1;
//   let count = 0;
//   for (offset = 1; offset < 5; offset++) {
//     console.log("offset no", offset);
//     const url = `https://www.google.com/search?q=${encodeURIComponent(
//       query
//     )}&offset=${offset}`;
//     console.log("url", url);
//     // Launch the browser
//     const browser = await puppeteer.launch({ headless: false }); // Set headless: true to run in headless mode
//     // Open a new page
//     const page = await browser.newPage();

//     // Navigate to the Google search page
//     await page.goto(url, { waitUntil: "networkidle2" });

//     // Wait for the results to load
//     await page.waitForSelector("a h3");

//     // Extract data from the search results
//     const results = await page.evaluate(() => {
//       // Select all anchor tags with h3 children (search result titles)
//       const anchors = Array.from(document.querySelectorAll("a h3"));
//       return anchors.map((anchor) => {
//         const href = anchor.closest("a").href; // Get the href attribute of the closest anchor tag
//         const h3Text = anchor.innerText; // Get the inner text of the h3 tag
//         return { href, h3Text };
//       });
//     });

//     // Log the extracted data
//     console.log("length", results.length);
//     console.log(results);
//     count += results.length
//     // Close the browser
//     await browser.close();
//   }
//   console.log(count)
// })();
