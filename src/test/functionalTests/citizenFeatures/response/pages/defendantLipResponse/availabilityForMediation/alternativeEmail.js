const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');
const sharedData = require("../../../../../sharedData");
const cButtons = require("../../../../../commonComponents/cButtons");
const contactUs = new ContactUs();

const fields = {
  altEmailAddressTextField: 'input[id="alternativeEmailAddress"]',
  noButton: 'input[value="no"]',
};

const content = {

  heading_can_the_mediation_team_use: {
    en: 'Can the mediation team use',
    cy: 'A all y tîm cyfryngu ddefnyddio',
  },

  heading_please_provide_an_alternative_email: {
    en: 'Please provide an alternative email address',
    cy: 'Nodwch gyfeiriad e-bost arall',
  },
};

class AlternativeEmail {

  async confirmAltEmail() {

    const { language } = sharedData;
    await I.waitForContent(content.heading_can_the_mediation_team_use[language], config.WaitForText);
    await I.click(fields.noButton);
    //await contactUs.verifyContactUs('cy');
    await this.clickSaveAndContinue();

    await I.waitForContent(content.heading_please_provide_an_alternative_email[language], config.WaitForText);
    await I.fillField(fields.altEmailAddressTextField, 'test@gmail.com');
    await this.clickSaveAndContinue();
  }

  async clickSaveAndContinue(){
    await I.click(cButtons.saveAndContinue[sharedData.language]);
  }
}

module.exports = AlternativeEmail;
