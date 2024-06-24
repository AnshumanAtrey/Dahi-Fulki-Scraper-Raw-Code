const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs/promises");
const FS = require("fs");
const zlib = require("zlib");
const ndjson = require("ndjson");

const userAgents = [
  "Mozilla/5.0 (Linux; Android 11; SM-G998U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1",
];

class RestaurantDetailsExtractor {
  constructor(outputFileName) {
    this.outputFileName = outputFileName;
  }

  async scrape() {
    try {
      puppeteer.use(StealthPlugin());
      const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        headless: false,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        userDataDir:
          "C:/Users/laksh/AppData/Local/Google/Chrome/User Data/Default",
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: ["--proxy-server=20.24.43.214:80"],
        ignoreDefaultArgs: ["--enable-automation"],
        args: [
          "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        ],
      });
      // Create a new page in the browser
      const page = await browser.newPage();

      // Set the user agent string for the page
      const userAgent =
        userAgents[Math.floor(Math.random() * userAgents.length)];
      await page.setUserAgent(userAgent);

      // Read the links from the links.txt file
      const linksFile = await fs.readFile("scraped_data/links.txt", "utf-8");
      const links = linksFile.trim().split("\n");
      const data = [];
      // Loop through the links
      for (const link of links) {
        // Navigate to the link
        await page.goto(link);

        // Wait for the content to load
        await new Promise((resolve) => setTimeout(resolve, 3000));

        //extracting name , cuisine, restaurantId ,time ,distance,isPromo, promoOffer,restaurantNotice
        const name = await page.evaluate(() => {
          return document.querySelector(
            "#page-content > div.sectionContainer__3GDBD.ant-layout > div > div.merchantInfo__1GGGp > h1"
          ).innerText;
        });
        console.log(name);

        const cuisine = await page.evaluate(() => {
          return document.querySelector(
            "#page-content > div.sectionContainer__3GDBD.ant-layout > div > div.merchantInfo__1GGGp > h3"
          ).innerText;
        });

        const restaurantImageLink = await page.evaluate(() => {
          return document.querySelector(
            "#page-content > div.sectionContainer__3GDBD.ant-layout > div > div.merchantPhotoWrapper__3os9- > div > img"
          ).src;
        });

        //extracting restaurant id
        const restaurantId = link.trim().split("/").pop().replace("?", "");

        const { time, distance } = await page.evaluate(() => {
          const content = document.querySelector(
            "#page-content > div.sectionContainer__3GDBD.ant-layout > div > div.merchantInfo_1GGGp > div.ratingAndDistance_1UT-a.infoRow__3TzCZ > div"
          ).textContent;
          //using regular expressions to catch time and distance from image elemt
          const timeRegex = /(\d+)\s+mins/;
          const distanceRegex = /•\s+([\d.]+)\s+km/;

          const timeMatch = content.match(timeRegex);
          const distanceMatch = content.match(distanceRegex);

          const time = timeMatch ? timeMatch[1] : "N/A"; // Extracted time, default to 'N/A' if not found
          const distance = distanceMatch ? distanceMatch[1] : "N/A"; // Extracted distance, default to 'N/A' if not found
          return { time, distance };
        });

        const { isPromo, promoOffer } = await page.evaluate(async () => {
          const promoElement = document.querySelector(
            "#page-content > div.sectionContainer__3GDBD.ant-layout > div > div > div.ant-row-flex.ant-row-flex-bottom.promoWrapper__y1C2e"
          );
          let isPromo = false;
          let promoOffer = "";

          //ig element is present promoOffer is set
          if (promoElement) {
            isPromo = true;
            promoOffer = document.querySelector(
              "#page-content > div.sectionContainer__3GDBD.ant-layout > div > div.merchantInfo_1GGGp > div.ant-row-flex.ant-row-flex-bottom.promoWrapper__y1C2e > div:nth-child(1) > div > div"
            ).textContent;
          }

          return { isPromo, promoOffer };
        });

        const restaurantNotice = await page.evaluate(() => {
          const noticeElement = document.querySelector(
            "#page-content > div.sectionContainer__3GDBD.ant-layout > div > div > div.orderFee__1uHwm"
          );
          let notice = "";
          if (noticeElement) {
            notice = noticeElement.querySelector(
              ".orderFeeContent___HyVYZ"
            ).textContent;
          }
          return notice;
        });

        data.push({
          name,
          cuisine,
          time,
          distance,
          isPromo,
          promoOffer,
          restaurantNotice,
          restaurantId,
          restaurantImageLink,
        });

        await page.evaluate(() => {
          document.cookie =
            "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });

        await browser.close();
      }
      this.saveData(data);
      console.log(data);
    } catch (error) {
      console.error("Your request is blocked by the website");
    }
  }

  saveData(restaurants) {
    const outputStream = FS.createWriteStream(this.outputFileName);
    const gzip = zlib.createGzip();
    const jsonStream = ndjson.stringify();
    jsonStream.pipe(gzip).pipe(outputStream);

    restaurants.forEach((restaurant) => jsonStream.write(restaurant));
    jsonStream.end();
  }
}

const extractor = new RestaurantDetailsExtractor(
  "./scraped_data/restaurantsList.json.gz"
);
extractor.scrape();
