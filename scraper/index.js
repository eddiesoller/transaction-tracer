require("dotenv").config();
const puppeteer = require("puppeteer");
const MongoClient = require("mongodb").MongoClient;
const baseUrl =
  process.env.BASE_URL ||
  "https://www.prosportstransactions.com/basketball/Search/SearchResults.php?PlayerMovementChkBx=yes&start=";
const timeout = process.env.TIMEOUT || 60000;
const delay = process.env.DELAY || 10000;
const tableSelector = "body > div.container > table.datatable.center > tbody";
const tableRowSelector = tableSelector + " > tr";
const nextSelector =
  "body > div.container > table:nth-child(5) > tbody > tr > td:nth-child(4) > p > a";

async function scrape() {
  let client;
  let browser;
  let page;
  let scrapedTransactions = 0;

  try {
    client = await MongoClient.connect(process.env.ATLAS_URI);
    browser = await puppeteer.launch();
    page = await browser.newPage();
    const db = client.db("transaction-tracer");
    let start = (await getLatestExternalId(db)) + 1;
    let loadTime = new Date(-8640000000000000);

    do {
      const elapsed = Date.now() - loadTime;
      if (elapsed < delay) {
        await sleep(delay - elapsed);
      }
      loadTime = Date.now();

      await page.goto(baseUrl + start, { timeout: timeout });
      await page.waitForSelector(tableSelector, { timeout: timeout });

      const pageTransactions = await scrapePage(page);
      saveTransactions(db, pageTransactions);
      start += pageTransactions.length;
      scrapedTransactions += pageTransactions.length;
    } while (await hasNextPage(page));

    console.log(
      "no more transactions to scrape. latest transaction id:",
      start - 1
    );
  } catch (error) {
    console.log("scraping error", error);
  } finally {
    console.log(`scraped ${scrapedTransactions} transactions`);
    await page.close();
    await browser.close();
    await client.close();
  }
}

async function getLatestExternalId(db) {
  const latestTransaction = await db
    .collection("transactions")
    .findOne({}, { sort: { externalId: -1 } });
  if (latestTransaction) {
    return latestTransaction.externalId || -1;
  }
  return -1;
}

async function scrapePage(page) {
  const start = parseStart(page.url());
  return await page.$$eval(
    tableRowSelector,
    (rows, start) => {
      function parseAssets(text) {
        return text
          .split("•")
          .map((asset) => asset.trim())
          .filter(String);
      }

      let rowNum = 0;
      return rows
        .filter((row) => !row.classList.contains("DraftTableLabel"))
        .map((row) => row.querySelectorAll("td"))
        .map((cells) => {
          const externalId = start + rowNum++;
          const date = cells[0].textContent.trim();
          const team = cells[1].textContent.trim();
          const acquired = parseAssets(cells[2].textContent);
          const relinquished = parseAssets(cells[3].textContent);
          const notes = cells[4].textContent.trim();

          return {
            externalId,
            date,
            team,
            acquired,
            relinquished,
            notes,
          };
        });
    },
    start
  );
}

function parseStart(url) {
  return parseInt(new URL(url).searchParams.get("start")) || 0;
}

async function saveTransactions(db, transactions) {
  if (!transactions || !transactions.length > 0) return;
  await db.collection("transactions").insertMany(transactions);
}

async function hasNextPage(page) {
  return (await page.$(nextSelector)) != null;
}

async function sleep(millis) {
  await new Promise((r) => setTimeout(r, millis));
}

scrape();
