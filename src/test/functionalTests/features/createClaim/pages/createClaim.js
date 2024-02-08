const I = actor();
/*const config = require('../../../../config');

const fields = {
  over25000: '#totalAmount',
  lessthan25000: '#totalAmount-2',
  dontKnowTheAmount: '#totalAmount-3',
  singleDefendantYes: '#option',
  singleDefendantNo: '#option-2',
  defendantAddressYes: '#option',
  defendantAddressNo: '#option-2',
  claimTypeMyOrg: '#claimType',
  claimTypeMoreThanOneOrg: '#claimType-2',
  claimTypeSolicitor: '#claimType-3',
  claimantAddressYes: '#option',
  claimantAddressNo: '#option-2',
  tenancyDepositYes: '#option',
  tenancyDepositNo: '#option-2',
  govtDeptYes: '#option',
  govtDeptNo: '#option-2',
  defendantAge18: '#defendant-age-eligibility',
  defendantAgeLessThan18: '#defendant-age-eligibility-2',
  defendantAgeAgainstComp: '#defendant-age-eligibility-3',
  claimantAge18: '#option',
  claimantAgeLessThan18: '#option-2',
  hwfReferenceYes: '#option',
  hwfReferenceNo: '#option-2',
};*/

class CreateClaim {

  async verifyLanguage() {
    I.see('Language', 'h1');
    I.see('You must choose which language you want to use to make this claim.');
    I.see('If you select \'Welsh\', information and documents will be presented in Welsh.');
    I.see('But some notifications about your claim will still be in English.');
    I.see('In what language do you want to make your claim?','h4');
    I.click('#option'); //English
    I.click('Save and continue');
  }
}
module.exports = CreateClaim;
