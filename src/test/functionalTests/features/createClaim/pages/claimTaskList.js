const I = actor();
const config = require('../../../../config');

const fields = {
  individual: '#claimantPartyType',
  soleTrader: '#claimantPartyType-2',
  ltdCompany: '#claimantPartyType-3',
  organisation: '#claimantPartyType-4',
  individualTitle: '#individualTitle',
  individualFirstName: '#individualFirstName',
  individualLastName: '#individualLastName',
  primaryAddressPostCode: 'input[name="primaryAddressPostcode"]',
  primaryAddressPostCodeDropdown: 'select[id="primaryAddresspostcodeAddress"]',
  addrLine1: 'input[id="primaryAddress[addressLine1]"]',
  addrLine2: 'input[id="primaryAddress[addressLine2]"]',
  addrLine3: 'input[id="primaryAddress[addressLine3]"]',
  city:  'input[id="primaryAddress[city]"]',
  postCode: 'input[id="primaryAddress[postCode]"]',
  correspondenceAddressYes: '#provideCorrespondenceAddress-2',
  corresAddrLine1: '#correspondenceAddress[addressLine1]',
  corresAddrLine2: '#correspondenceAddress[addressLine2]',
  corresAddrLine3: '#correspondenceAddress[addressLine3]',
  corresCity: '#correspondenceAddress[city]',
  corresPostCode: '#correspondenceAddress[postCode]',
};

class ClaimTaskList {
  async VerifyClaimTaskListPage() {
    await I.amOnPage('/claim/task-list');
    await I.waitForText('Make a money claim', config.WaitForText);
    await I.see('Application complete');
    await I.see('After you have completed all the actions you will be taken to a page where you can check your answers before submitting.');
    await I.see('You have completed');
    await I.see('Consider other options');
    await I.see('Resolving this dispute');
    await I.see('Prepare your claim');
    await I.see('Completing your claim');
    await I.see('Your details');
    await I.see('Their details');
    await I.see('Claim amount');
    await I.see('Claim details');
    await I.see('Submit');
    await I.see('Check and submit your claim');
  }

  async ResolveDispute(){
    await I.waitForText('Make a money claim', config.WaitForText);
    await I.click('Resolving this dispute');
    await I.seeInCurrentUrl('/claim/resolving-this-dispute');
    await I.see('Try to resolve the dispute');
    await I.see('Before you claim you should:');
    await I.see('talk to the person or organisation you want to claim against');
    await I.see('consider mediation');
    await I.see('Talk to the person or organisation');
    await I.see('Try to resolve the dispute by:');
    await I.see('telling them why you intend to make a claim against them');
    await I.see('suggesting timetable with actions you want them to take');
    await I.see('explaining you\'ll make a claim against them if they don\'t follow your timetable');
    await I.see('Contact us for help');
    await I.click('I confirm I\'ve read this');
  }

  async CompletingYourClaim(){
    await I.waitForText('Make a money claim', config.WaitForText);
    await I.click('Completing your claim');
    await I.seeInCurrentUrl('/claim/completing-claim');
    await I.see('Get the details right');
    await I.see('You\'ll have to pay an additional fee if you want you:');
    await I.see('change the name of anyone involved with the claim');
    await I.see('change the basis of your claim - for example, saying goods were undelivered instead of faulty');
    await I.see('add information that significantly change your claim');
    await I.see('Contact us for help');
    await I.click('I confirm I\'ve read this');
  }

  async YourDetails(partyType){
    await I.waitForText('Make a money claim', config.WaitForText);
    await I.click('Your details');
    await I.seeInCurrentUrl('/claim/claimant-party-type-selection');
    await I.see('About you and this claim');
    await I.see('I\'m claiming as:');
    await I.see('An individual');
    await I.see('You\'re claiming for yourself');
    await I.see('A sole trader or self-employed person');
    await I.see('For example a tradesperson');
    await I.see('A limited company');
    await I.see('For example a company that sells goods or services');
    await I.see('Another type of organisation');
    await I.see('For example a partnership, trust, charity, club or association');
    await I.see('Contact us for help');
    switch (partyType){
      case 'individual':{
        await I.click(fields.individual);
        await I.click('Save and continue');
        await I.seeInCurrentUrl('claim/claimant-individual-details');
        await I.waitForText('Enter your details', config.WaitForText);
        await I.see('These details are shared with the person, business or organisation you are claiming from (the defendant).');
        await I.see('Title');
        await I.see('First name');
        await I.see('Last name');
        await I.see('Your postal address');
        await I.see('If your address is not correct you can change it here. Any changes will be shared with the claimant when you submit your response.');
        await I.see('Enter a UK postcode');
        await I.see('Enter address manually');
        await I.see('Correspondence address');
        await I.see('Would you like correspondence sent to a different address?');
        await I.fillField(fields.individualTitle, 'Mr');
        await I.fillField(fields.individualFirstName, 'TestFName');
        await I.fillField(fields.individualLastName, 'TestLName');
        // await I.fillField(fields.primaryAddressPostCode, 'IG2 6QP');
        // await I.click('Find address');

        await I.click('Enter address manually');
        await I.fillField(fields.addrLine1, 'addr street 1');
        await I.fillField(fields.addrLine2, 'addr street 2');
        await I.fillField(fields.addrLine3, 'addr street 3');
        await I.fillField(fields.city, 'London');
        await I.fillField(fields.postCode, 'IG2 6QU');
        break;
      }
      case 'soleTrader':{
        await I.click(fields.soleTrader);
        break;
      }
      case 'ltdCompany':{
        await I.click(fields.ltdCompany);
        break;
      }
      case 'organisation':{
        await I.click(fields.organisation);
        break;
      }
    }
    await I.click('Save and continue');
  }
}

module.exports = ClaimTaskList;
