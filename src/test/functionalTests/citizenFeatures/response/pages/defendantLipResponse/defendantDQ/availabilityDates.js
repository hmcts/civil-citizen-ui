const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  singleDate: 'input[id="items-0-single-date"]',
  longerPeriod: 'input[id="items-1-longer-period"]',
  singleDateDay: 'input[name="items[0][single][start][day]"]',
  singleDateMonth: 'input[name="items[0][single][start][month]"]',
  singleDateYear:'input[name="items[0][single][start][year]"]',
  longerPeriodStartDay: 'input[id="items[1][startDay]"]',
  longerPeriodStartMonth: 'input[id="items[1][startMonth]"]',
  longerPeriodStartYear: 'input[id="items[1][startYear]"]',
  longerPeriodEndDay: 'input[id="items[1][endDay]"]',
  longerPeriodEndMonth: 'input[id="items[1][endMonth]"]',
  longerPeriodEndYear: 'input[id="items[1][endYear]"]',
};

const content ={
  heading: {
    en: 'Add a single date or longer period of time when you, your experts or witnesses cannot go to a hearing',
    cy: 'Ychwanegwch ddyddiad unigol neu gyfnod hirach pan na allwch chi, eich arbenigwyr neu\'ch tystion fynd i wrandawiad',
  },
  mediationHeading: {
    en: 'Add a single date or longer period of time that you cannot attend meditation',
    cy: 'Ychwanegwch un dyddiad neu gyfnod hwy o amser na allwch fynychu myfyrdod',
  },
};

const buttons = {
  addAnotherDate: {
    en: 'Add another date or period of time',
    cy: 'Ychwanegu dyddiad neu gyfnod arall o amser',
  },
};

const newDate = new Date(new Date().setMonth(new Date().getMonth()+2));
const month = newDate.getMonth() + 1;
const year = newDate.getFullYear();
class AvailabilityDates {

  async enterUnavailableDates(meditation = false) {

    const { language } = sharedData;
    if (meditation){
      await I.waitForContent(content.mediationHeading[language], config.WaitForText);
    } else {
      await I.waitForContent(content.heading[language], config.WaitForText);
    }

    await I.click(fields.singleDate);
    await I.waitForElement(fields.singleDateDay, config.WaitForText);
    await I.click(fields.singleDateDay);
    await I.fillField(fields.singleDateDay, '10');
    await I.fillField(fields.singleDateMonth, month);
    await I.fillField(fields.singleDateYear, year);

    await I.click(buttons.addAnotherDate[language]);
    await I.click(fields.longerPeriod);
    await I.waitForElement(fields.longerPeriodStartDay, config.WaitForText);
    await I.fillField(fields.longerPeriodStartDay, '15');
    await I.fillField(fields.longerPeriodStartMonth, month);
    await I.fillField(fields.longerPeriodStartYear, year);

    await I.fillField(fields.longerPeriodEndDay, '20');
    await I.fillField(fields.longerPeriodEndMonth, month);
    await I.fillField(fields.longerPeriodEndYear, year);
    await I.click('button[class=\'govuk-button\']');
    //TODO - Revert to a Language Specific click for this page as this is an interimn solution as the Button names are differing in the journey.
  }
}

module.exports = AvailabilityDates;
