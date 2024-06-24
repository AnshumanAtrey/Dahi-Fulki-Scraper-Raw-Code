# Dahi Fulki Scraper

This repository contains a web scraper built using Puppeteer. The scraper extracts links of restaurants from Zomato's page and then scrapes detailed information from each restaurant link.

## Project Structure

```
C:\Users\anshu\OneDrive\Desktop\code\Dahi Fulki Scraper
│
├── node_modules/           # Directory for Node.js modules
├── .gitattributes          # Git attributes file
├── .gitignore              # Git ignore file
├── data.json               # JSON file where the scraped restaurant data is stored
├── get-links.js            # Script to fetch restaurant links
├── link-data-extractor.js  # Script to extract data from each restaurant link
├── links.txt               # Text file containing all the restaurant links
├── package-lock.json       # Lockfile for Node.js dependencies
└── package.json            # Node.js project metadata
```

## Scripts Overview

### get-links.js

This script navigates to Zomato's Dehradun best restaurants page and extracts all restaurant links, saving them to `links.txt`.

**Relevant Line:**
Edit the Zomato Link Here

```javascript
await page.goto("https://www.zomato.com/dehradun/best-restaurants");
```

**links.txt File:**
Once `get-link.js` finish running it will store all the restaurant link in this text file.

### link-data-extractor.js

This script reads the URLs from links.txt, visits each one, and scrapes the restaurant's name, address, and phone numbers, saving the data in data.json.

**data.json File:** One `link-data-extractor.js` finish runningit will store the data in this file.

## Setup Instructions

### Prerequisites

Node.js installed on your machine

### Installation

Clone the repository:

```bash
git clone https://github.com/AnshumanAtrey/Dahi-Fulki-Scraper-Raw-Code/
```

Navigate to the project directory:

```bash
cd Dahi-Fulki-Scraper
```

Install dependencies:

```bash
npm install
```

### Usage

Run the get-links.js script to fetch restaurant links:

_Make sure replace the URL on the line 30 with zomato page of your desiered location._

```bash
node get-links.js
```

Run the link-data-extractor.js script to scrape restaurant data:

```bash
node link-data-extractor.js
```

After running these scripts, you will find the scraped restaurant data in data.json.

---

Happy scraping!
