# a11y Test with Mock

### Contents:
- [Ignoring a url](#ignoring-a-url)
- [Creating a new mock](#creating-a-new-mock)
- [Running the a11y test](#running-the-a11y-test)

## Ignoring a url

### My url does not have a view

Accessiblity tests visits all urls specified in:
```bash
src/main/routes/urls.ts
```
If your url does not have a view, there is no need for it to be visited.
Make sure to add it to:
```bash
src/test/a11y/ignored-urls.ts
```

## Creating a new mock

When your url does have a view, you'll have to take an extra step of adding a mock of it.

### 1. Manual grab

#### Go to webpage

You will need to visit the new URL to render the view in the browser.
Go to inspector, and copy the <html> element.

#### Save to  a mock file

The copied element will need to be pasted into a mock file in:
```bash
src/test/utils/mocks/a11y
```
The names of the file use the url, and follow the format:
1. starts with: 'mock-'
2. every '/' becomes '-'
3. ':id' becomes '1645882162449409'
4. 'documentId' becomes '2'
5. 'uniqueId' becomes '3'
6. ends in .html

As an example
```bash
case/:id/apply-help-with-fees
```
becomes
```bash
mock-case-1645882162449409-apply-help-with-fees.html
```

### 2. Scraper

#### If you have a lot of pages, scraping might be more worthwhile. Scraping is done through:
```bash
src/test/a11y/a11y.scrape.ts
```
#### Check the URL
In a11y.scrape.ts, the scrape method is fed an array of urls to scrape. It is currently set to scrape a variable urlsList, but you can put in another array for your purposes.
#### Change the Jest config
Adapt the Jest config to use the a11y.scrape.ts class.
Change the text '(test|spec)' to '(scrape|spec)' at the top of the config:
```bash
jest.a11y.config.js
```
#### Optional: Turn off guards on any pages to scrape
If you have a guard on your page, or are intending to rescrape all views. Make sure you disable any guards, or the pages will redirect rather than render a view.

#### Change package.json
In package.json, to use the Jest config, change test:a11y to:
```bash
jest -c jest.a11y.config.js
```
Click the green arrow to run the config, and the scraper will start running.
Files do not show immediately upon finish. You might have to wait a few seconds and close/reopen the folder with mocks before they appear.

## Running the a11y test

### Go to package.json

Run the tests:a11y command.

If your mock does not load, or your mock uses a line signalling a redirect, rather than a view, errors will show.

Check each error, and either update the mock, or ignore the url as appropriate.
