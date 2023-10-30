const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class TrialArrangementsIntroduction {

  checkPageFullyLoaded () {
    I.waitForElement('//a[contains(.,\'Start now\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyIsTheCaseReadyForTrialSectionContent();
    this.verifyTrialAdjustmentsAndDurationSectionContent();
    this.verifyOtherSectionContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Finalise your trial arrangements', 'h1');
    //I.see('Case reference');
    I.see('Test Inc v Sir John Doe');
    I.see('You have until');
    I.see('to provide this information.');
    I.see('You should finalise your trial arrangements to ensure the court has the necessary information for the trial'); +
    I.see('to proceed in a suitable way.');
  }

  verifyIsTheCaseReadyForTrialSectionContent() {
    I.see('Is the case ready for trial?','h3');
    I.see('We are asking you to confirm the case is ready for the trial.');
    I.see('This means you have taken all the action required of you in the');
    I.seeElement('//a[.=\'directions order\']');
    I.see('that you have received.');

    I.see('If your case is not ready and you do not think it will be ready by the deadline for finalising your trial arrangements,');
    I.see('you may wish to postpone or adjourn the trial. To do this, you will need to make an application to the court.');
    I.see('If you need to make an application, you must complete and submit your trial arrangements first.');
    I.see('You should only make an application once this has been completed.');
    I.see('There will be a link to make an application once you have finalised your trial arrangements.');
    I.see('If you make an application, please note the trial will go ahead as planned until the application is reviewed by a judge and an order made changing the date of the trial.');
  }

  verifyTrialAdjustmentsAndDurationSectionContent() {
    I.see('Trial adjustments and duration','h3');
    I.see('You will be asked to specify if there are any changes to the support or adjustments you previously specified in your');
    I.seeElement('//a[.=\'directions questionnaire.\']');
    I.see('You should review this to identify if your circumstances have changed.');
    I.see('We will remind you of the time allocated for the trial. If you feel less time is needed, you can specify why in the \'other information\' box.');
    I.see('If you feel that more time will be required, you will need to liaise with the other party and make an application to the court.');
    I.see('If you need to make an application, you must complete and submit your trial arrangements first.');
    I.see('You should only make an application once this has been completed.');
  }

  verifyOtherSectionContent() {
    I.see('Other information','h3');
    I.see('You will be given the opportunity to provide any other information relevant to the trial, for example if any party is only available at a specific time.');
  }
}

module.exports = TrialArrangementsIntroduction;
