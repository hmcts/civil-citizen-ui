const I = actor();
const config = require('../../../../../../config');

const fields = {
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  disagreeOption4: 'input[id="disagreeMediationOption-4"]',

  welsh : {
    links : {
      i_do_not_agree_to_mediation : '//a[contains(.,\'Nid wyf yn cytuno i gyfryngu am ddim\')]',
    },
  },
};

class FreeTelephoneMediation {

  async selectMediation(claimRef, language='en') {
    await I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    console.log('The value of the language : '+language);
    if (language === 'en') {
      await I.waitForText('Free telephone mediation', config.WaitForText);
      await I.click('Continue');
    } else if (language === 'cy') {
      I.click('Cymraeg');
      await I.waitForText('Gwasanaeth cyfryngu dros y ffôn am ddim', config.WaitForText);
      await I.click('Parhau');
      I.click('English');
    }
  }

  async selectNoMediation(claimRef, language='en'){
    await I.amOnPage('/case/'+claimRef+'/mediation/free-telephone-mediation');
    console.log('The value of the language : '+language);
    if (language === 'en') {

      await I.waitForText('Free telephone mediation', config.WaitForText);
      await I.click('I do not agree to free mediation');
      await I.see('The claim will continue and you may have to go to a hearing.');
      await I.see('Advantages of free mediation');
      await I.see('There are many advantages to free mediation, including:');
      await I.see('You chose not to try free mediation');
      await I.click(fields.noButton);
      await I.click('Save and continue');
      await I.seeInCurrentUrl('/mediation/i-dont-want-free-mediation');
      await I.see('I do not agree to free mediation');
      await I.see('You have chosen not to try free mediation. Please tell us why:');
      await I.click(fields.disagreeOption4);
      await I.click('Save and continue');

    } else if (language === 'cy') {

      I.click('Cymraeg');
      await I.waitForText('Gwasanaeth cyfryngu dros y ffôn am ddim', config.WaitForText);
      await I.click(fields.welsh.links.i_do_not_agree_to_mediation);
      await I.see('Bydd yr hawliad yn parhau ac efallai y bydd rhaid ichi fynychu gwrandawiad.');
      await I.see('Manteision cyfryngu am ddim');
      await I.see('Mae yna lawer o fanteision i gyfryngu am ddim, gan gynnwys:');
      await I.see('Mi wnaethoch ddewis i beidio â chael cyfryngu am ddim');
      await I.click(fields.noButton);
      await I.click('Cadw a Pharhau');
      await I.seeInCurrentUrl('/mediation/i-dont-want-free-mediation');
      await I.see('Nid wyf yn cytuno i gyfryngu am ddim');
      await I.see('Rydych wedi dewis peidio â rhoi cyfle i gyfryngu am ddim. Dywedwch wrthym pam:');
      await I.click(fields.disagreeOption4);
      await I.click('Cadw a Pharhau');
      I.click('English');
    }
  }
}

module.exports = FreeTelephoneMediation;
