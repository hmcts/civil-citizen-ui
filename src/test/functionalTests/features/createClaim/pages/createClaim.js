const I = actor();
/*const config = require('../../../../config');*/

const paths = {
  links: {
    resolving_this_dispute: '//a[.=\'Resolving this dispute\']',
    confirming_your_claim: '//a[.=\'Completing your claim\']',
    your_details: '//a[.=\'Your details\']',
  },
  buttons: {
    i_have_confirmed_i_have_read_this: 'I confirm I\'ve read this',
    save_and_continue: 'Save and continue',
  },
  fields: {
    individual_title: '#individualTitle',
    individual_first_name: '#individualFirstName',
    individual_last_name: '#individualLastName',
  },
};

class CreateClaim {

  async verifyLanguage() {
    I.see('Language', 'h1');
    I.see('You must choose which language you want to use to make this claim.');
    I.see('If you select \'Welsh\', information and documents will be presented in Welsh.');
    I.see('But some notifications about your claim will still be in English.');
    I.see('In what language do you want to make your claim?', 'h4');
    I.click('#option'); //English
    I.click('Save and continue');
  }

  async verifyDashboard() {
    I.see('Application complete', 'h2');
    I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    I.see('Consider other options', 'h2');
    I.see('Prepare your claim', 'h2');
    I.see('Submit', 'h2');
    this.clickNextAction(paths.links.resolving_this_dispute);
  }

  async verifyDashboardLoaded() {
    I.waitForText('Submit', 'h2');
    I.see('Application complete', 'h2');
  }

  async verifyTryToResolveTheDispute() {
    I.see('Try to resolve the dispute', 'h1');
    I.see('Before you claim you should:');
    I.see('talk to the person or organisation you want to claim against');
    I.see('consider mediation');
    I.see('Talk to the person or organisation', 'h2');
    I.see('Try to resolve the dispute by:');
    I.see('telling them why you intend to make a claim against them');
    I.see('suggesting timetable with actions you want them to take');
    I.see('explaining you\'ll make a claim against them if they don\'t follow your timetable');
    this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
    await this.verifyDashboardLoaded();
    this.clickNextAction(paths.links.confirming_your_claim);
  }

  async verifyCompletingYourClaim() {

    I.see('Get the details right', 'h1');
    I.see('You\'ll have to pay an additional fee if you want you:');
    I.see('change the name of anyone involved with the claim');
    I.see('change the basis of your claim - for example, saying goods were undelivered instead of faulty');
    I.see('Talk to the person or organisation', 'h2');
    I.see('add information that significantly change your claim');
    this.clickNextAction(paths.buttons.i_have_confirmed_i_have_read_this);
    await this.verifyDashboardLoaded();
    this.clickNextAction(paths.links.your_details);
  }

  verifyAboutYouAndThisClaim() {
    I.see('About you and this claim', 'h1');
    I.see('I\'m claiming as:');
    I.see('An individual');
    I.see('You\'re claiming for yourself');
    I.see('A sole trader or self-employed person');
    I.see('For example a tradesperson');
    I.see('A limited company');
    I.see('For example a company that sells goods or services');
    I.see('Another type of organisation');
    I.see('For example a partnership, trust, charity, club or association');
    this.clickNextAction(paths.buttons.save_and_continue);
  }

  verifyEnterYourDetails() {
    I.see('Enter your details', 'h1');
    I.see('These details are shared with the person, business or organisation you are claiming from (the defendant).');
    I.see('Title');
    I.see('First name');
    I.see('Last name');
    I.see('Your postal address', 'h2');
    I.see('If your address is not correct you can change it here.');
    I.see('Any changes will be shared with the claimant when you submit your response.');
    I.see('Enter a UK postcode');
  }

  inputEnterYourDetails() {
    I.fillField(this.paths.fields.individual_title,'Mr');
    I.fillField(this.paths.fields.individual_first_name,'Joe');
    I.fillField(this.paths.fields.individual_last_name,'Bloggs');
  }

  clickNextAction(action) {
    I.click(action);
  }
}

module.exports = CreateClaim;
