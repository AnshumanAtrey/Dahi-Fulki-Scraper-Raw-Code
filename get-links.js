const puppeteer = require("puppeteer");
const fs = require("fs/promises");

// Set the user agent string to mimic a desktop browser
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299";

// Define the main function to start the scraping process
async function start() {
  // Launch a new browser instance
  const browser = await puppeteer.launch();

  // Create a new page in the browser
  const page = await browser.newPage();

  // Set the user agent string for the page
  await page.setUserAgent(userAgent);

  // Navigate to the target URL
  await page.goto("https://www.zomato.com/dehradun/best-restaurants");

  // Scroll to the bottom of the page to load all the elements
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Initialize a variable to keep track of the number of divs
  let numOfDivs = 0;

  // Loop until we have at least 495 divs with the class "jumbo-tracker"
  while (numOfDivs < 495) {
    // Get the number of divs with the class "jumbo-tracker"
    numOfDivs = await page.evaluate(() => {
      return document.querySelectorAll(".jumbo-tracker").length;
    });

    // Wait for 5 seconds before the next iteration
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Extract the href attributes of the a tags inside the divs with the class "jumbo-tracker"
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".jumbo-tracker")).map(
      (x) => x.querySelector("a").href
    );
  });

  // Write the extracted links to a file
  await fs.writeFile("links.txt", links.join("\r\n"));

  // Close the browser instance
  await browser.close();
}

// Call the start function to begin the scraping process
start();
