const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const contactUs = new ContactUs();

const fields = {
  altPhoneTextField: 'input[id="alternativeTelephone"]',
  yesButton: 'input[value="yes"]',
  noButton: 'input[value="no"]',
  availabilityForMediationLink: 'a[href*="phone-confirmation"]',
};

const content = {
  heading_can_the_mediator_use: {
    en: 'Can the mediator use',
    cy: 'A all y cyfryngwr ddefnyddio',
  },

  subHeading_can_the_mediation_use: {
    en: 'Can the mediation team use',
    cy: 'A all y tîm cyfryngu ddefnyddio',
  },

  heading_please_provide_an_alternative_email: {
    en: 'Please provide an alternative email address',
    cy: 'Nodwch gyfeiriad e-bost arall',
  },

  heading_are_there_any_dates_in_the_next_3_months : {
    en: 'Are there any dates in the next 3 months when you cannot attend mediation?',
    cy: 'A oes unrhyw ddyddiadau yn y 3 mis nesaf lle na allwch fynychu apwyntiad cyfryngu?',
  },

  heading_add_a_single_date_or : {
    en: 'Add a single date or longer period of time that you cannot attend mediation',
    cy: 'Nodwch ddyddiad unigol neu gyfnod hirach o amser pan na allwch fynychu apwyntiad cyfryngu',
  },
};

class PhoneConfirmation {

  async goToPhoneDetailsScreen() {
    await I.forceClick(fields.availabilityForMediationLink);
  }

  async enterPhoneDetails() {
    I.waitForContent('Can the mediator use ', config.WaitForText);
    I.click('Save and continue');
    I.see('Select if the mediator can call you on');
    I.see('for your mediation appointment or not');
    I.dontSee('[phone number]');
    I.click(fields.yesButton);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
  }

  async enterAltPhoneDetails() {
    await I.click(fields.availabilityForMediationLink);
    const { language } = sharedData;
    await I.waitForContent(content.heading_can_the_mediator_use[language], config.WaitForText);
    await I.click(fields.yesButton);
    //await contactUs.verifyContactUs('cy');
    await this.clickSaveAndContinue();
  }

  async clickSaveAndContinue(){
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = PhoneConfirmation;
