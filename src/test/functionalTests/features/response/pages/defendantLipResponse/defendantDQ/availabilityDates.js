
const I = actor();

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

const newDate = new Date(new Date().setMonth(new Date().getMonth()+2));
const month = newDate.getMonth();
const year = newDate.getFullYear();

class AvailabilityDates {

  enterUnavailableDates(claimRef) {

    I.amOnPage('/case/'+claimRef+'/directions-questionnaire/availability-dates');
    I.see('Add a single date or longer period of time when you, your experts or witnesses cannot go to a hearing', 'h1');

    I.click(fields.singleDate);
    I.waitForElement(fields.singleDateDay);
    I.click(fields.singleDateDay);
    I.fillField(fields.singleDateDay, '10');
    I.fillField(fields.singleDateMonth, month);
    I.fillField(fields.singleDateYear, year);

    I.click('Add another date or period of time');
    I.click(fields.longerPeriod);
    I.waitForElement(fields.longerPeriodStartDay);
    I.fillField(fields.longerPeriodStartDay, '15');
    I.fillField(fields.longerPeriodStartMonth, month);
    I.fillField(fields.longerPeriodStartYear, year);

    I.fillField(fields.longerPeriodEndDay, '20');
    I.fillField(fields.longerPeriodEndMonth, month);
    I.fillField(fields.longerPeriodEndYear, year);

    I.click('Save and continue');
  }
}

module.exports = AvailabilityDates;
