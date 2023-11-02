const I = actor();
const config = require('../../../../../../config');
import {addMonths} from 'common/utils/dateUtils';

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

const newDate = addMonths(new Date(),4);
const month = newDate.getMonth();
const year = newDate.getFullYear();
class AvailabilityDates {

  async enterUnavailableDates() {
    await I.waitForText('Add a single date or longer period of time when you, your experts or witnesses cannot go to a hearing', config.WaitForText);

    await I.click(fields.singleDate);
    await I.waitForElement(fields.singleDateDay, config.WaitForText);
    await I.click(fields.singleDateDay);
    await I.fillField(fields.singleDateDay, '10');
    await I.fillField(fields.singleDateMonth, month);
    await I.fillField(fields.singleDateYear, year);

    await I.click('Add another date or period of time');
    await I.click(fields.longerPeriod);
    await I.waitForElement(fields.longerPeriodStartDay, config.WaitForText);
    await I.fillField(fields.longerPeriodStartDay, '15');
    await I.fillField(fields.longerPeriodStartMonth, month);
    await I.fillField(fields.longerPeriodStartYear, year);

    await I.fillField(fields.longerPeriodEndDay, '20');
    await I.fillField(fields.longerPeriodEndMonth, month);
    await I.fillField(fields.longerPeriodEndYear, year);

    await I.click('Save and continue');
  }
}

module.exports = AvailabilityDates;
