const puppeteer = require("puppeteer");
const fs = require("fs/promises");

// Set the user agent string to mimic a desktop browser
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299";

// Define the main function to start the scraping process
async function start() {
  // Launch a new browser instance
  const browser = await puppeteer.launch({
    headless: false,
  });

  // Create a new page in the browser
  const page = await browser.newPage();

  // Set the user agent string for the page
  await page.setUserAgent(userAgent);

  // Initialize an array to store the extracted data
  const data = [];

  // Read the links from the links.txt file
  const linksFile = await fs.readFile("links.txt", "utf-8");
  const links = linksFile.trim().split("\n");

  // Loop through the links
  for (const link of links) {
    // Navigate to the link
    await page.goto(link);

    // Wait for the content to load
    await page.waitForSelector(".sc-1hez2tp-0");

    // Extract the name, address, and phone numbers
    const name = await page.evaluate(() => {
      return document.querySelector(".sc-7kepeu-0.sc-iSDuPN").innerText;
    });

    const address = await page.evaluate(() => {
      return document.querySelector(".sc-1hez2tp-0.sc-1hez2tp-0.clKRrC")
        .innerText;
    });

    const phoneNumbers = await page.evaluate(() => {
      const phoneNodes = document.querySelectorAll(".sc-1hez2tp-0.fanwIZ");
      return Array.from(phoneNodes).map((node) => node.innerText);
    });

    // Save the extracted data in the data array
    data.push({ name, address, phoneNumbers });

    // Clear the cookies to avoid any issues with the next link
    await page.evaluate(() => {
      document.cookie =
        "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });
  }

  // Write the extracted data to a JSON file
  await fs.writeFile("data.json", JSON.stringify(data, null, 2));

  // Close the browser instance
  await browser.close();
}

// Call the start function to begin the scraping process
start();
