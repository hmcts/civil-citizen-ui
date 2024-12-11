const I = actor();
const config = require('../../../../config');

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
};

class EligibilityCheck {
  async open() {
    await I.amOnPage('/eligibility');
    await I.waitForContent('Try the new online service', config.WaitForText);
    await I.see('We are building a new service. Different designs are being tested and changed based on feedback from users.');
    await I.see('You will be asked some questions to check you are eligible to use this service.');
    await I.see('Contact us for help');
    await I.click('Continue');
  }

  async eligibilityClaimValueValidations() {
    await I.waitForContent('Total amount you\'re claiming');
    await I.see('If you\'re claiming interest, include that in the amount');
    await I.see('Over £25,000');
    await I.see('£25,000 or less');
    await I.see('I don\'t know the amount');

    await I.click(fields.over25000);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=claim-value-over-25000');
    await I.see('You can’t use this service');
    await I.see('This service is for claims of £25,000 or less.');
    await I.see('For claims between £25,001 and £100,000 you might be able to use Money Claim Online (MCOL) (opens in a new window)');
    await I.see('You can also claim by paper. Download a paper form (opens in a new window) complete it and return it to make your claim.');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/claim-value');

    await I.waitForContent('Total amount you\'re claiming');
    await I.click(fields.dontKnowTheAmount);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=claim-value-not-known');
    await I.see('You can’t use this service');
    await I.see('You need to know the claim amount to use this service.');
    await I.see('If you can’t calculate the claim amount, for example because you’re claiming for an injury or accident, use the N1 paper form (opens in a new window) .');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/claim-value');
  }

  async eligibilityKnownClaimAmount() {
    await I.waitForContent('Do you know the amount you are claiming?');
    await I.click('Yes');
    await I.click('Save and continue');
  }

  async eligibilityClaimValue() {
    await I.waitForContent('Total amount you\'re claiming');
    await I.click(fields.lessthan25000);
    await I.click('Save and continue');
  }

  async eligibilitySingleDefendantValidations(){
    await I.seeInCurrentUrl('/eligibility/single-defendant');
    await I.waitForContent('Is this claim against more than one person or organisation?');
    await I.click(fields.singleDefendantYes);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=multiple-defendants');
    await I.see('You can’t use this service');
    await I.see('You can’t use this service if this claim is against more than one person or organisation.');
    await I.see('Use Money Claim Online (MCOL) (opens in a new window) . for claims against 2 people or organisations.');
    await I.see('Download a paper form (opens in a new window) . for claims against 3 or more people or organisations. Complete and return the form to make your claim.');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/single-defendant');
  }

  async eligibilitySingleDefendant() {
    await I.waitForContent('Is this claim against more than one person or organisation?');
    await I.click(fields.singleDefendantNo);
    await I.click('Save and continue');
  }

  async eligibilityDefendantAddressValidations(){
    await I.seeInCurrentUrl('/eligibility/defendant-address');
    await I.waitForContent('Does the person or organisation you’re claiming against have a postal address in England or Wales?');
    await I.click(fields.defendantAddressNo);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=defendant-address');
    await I.see('You can’t use this service');
    await I.see('You can only use this service to claim against a person or organisation with an address in England or Wales.');
    await I.see('Depending on where you’ll be sending the claim, you might be able to claim using a paper form. Download the paper form N1 (opens in a new window) and form N510 (opens in a new window) . Complete the forms and return them to make your claim.');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/defendant-address');
  }

  async eligibilityDefendantAddress() {
    await I.waitForContent('Does the person or organisation you’re claiming against have a postal address in England or Wales?');
    await I.click(fields.defendantAddressYes);
    await I.click('Save and continue');
  }

  async eligibilityClaimTypeValidations(){
    await I.seeInCurrentUrl('/eligibility/claim-type');
    await I.waitForContent('Who are you making the claim for?');
    await I.see('Just my self or my organisation');
    await I.see('More than one person or organisation');
    await I.see('A client - I\'m their solicitor');
    await I.click(fields.claimTypeMoreThanOneOrg);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=multiple-claimants');
    await I.see('You can’t use this service');
    await I.see('You can’t use this service if more than one person or organisation is making the claim.');
    await I.see('Download a paper form (opens in a new window) , complete it and return it to make your claim.');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/claim-type');

    await I.waitForContent('Who are you making the claim for?');
    await I.click(fields.claimTypeSolicitor);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=claim-on-behalf');
    await I.see('You can’t use this service');
    await I.see('This service is currently for claimants representing themselves.');
    await I.see('If you’re a legal representative use the Money Claim Online (MCOL) service (opens in a new window) or download a paper form (opens in a new window) , complete and return it to make your claim.');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/claim-type');
  }

  async eligibilityClaimType() {
    await I.waitForContent('Who are you making the claim for?');
    await I.click(fields.claimTypeMyOrg);
    await I.click('Save and continue');
  }

  async eligibilityClaimantAddressValidations(){
    await I.seeInCurrentUrl('/eligibility/claimant-address');
    await I.waitForContent('Do you have a postal address in England or Wales?');
    await I.click(fields.claimantAddressNo);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=claimant-address');
    await I.see('You can’t use this service');
    await I.see('You need to have an address in the UK to make a money claim.');
    await I.amOnPage('/eligibility/claimant-address');
  }

  async eligibilityClaimantAddress() {
    await I.waitForContent('Do you have a postal address in England or Wales?');
    await I.click(fields.claimantAddressYes);
    await I.click('Save and continue');
  }

  async eligibilityTenancyDepositValidations(){
    await I.seeInCurrentUrl('/eligibility/claim-is-for-tenancy-deposit');
    await I.waitForContent('Is your claim for a tenancy deposit?');
    await I.click(fields.tenancyDepositYes);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=claim-is-for-tenancy-deposit');
    await I.see('You can’t use this service');
    await I.see('You can’t make a claim for a tenancy deposit using this service.');
    await I.see('Get help to resolve your dispute (opens in a new window) with a landlord or tenant.');
    await I.amOnPage('/eligibility/claim-is-for-tenancy-deposit');
  }

  async eligibilityTenancyDeposit() {
    await I.waitForContent('Is your claim for a tenancy deposit?');
    await I.click(fields.tenancyDepositNo);
    await I.click('Save and continue');
  }

  async eligibilityGovtDeptValidations(){
    await I.seeInCurrentUrl('/eligibility/government-department');
    await I.waitForContent('Are you claiming against a government department?');
    await I.see('See list of government departments (opens in a new window).');
    await I.click(fields.govtDeptYes);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=government-department');
    await I.see('You can’t use this service');
    await I.see('You can\'t use this service to claim against government departments (opens in a new window)');
    await I.see('Download a paper form (opens in a new window) , complete it and return it to make your claim');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/government-department');
  }

  async eligibilityGovtDept() {
    await I.waitForContent('Are you claiming against a government department?');
    await I.click(fields.govtDeptNo);
    await I.click('Save and continue');
  }

  async eligibilityDefendantAgeValidations(){
    await I.seeInCurrentUrl('/eligibility/defendant-age');
    await I.waitForContent('Do you believe the person you’re claiming against is 18 or over?');
    await I.click(fields.defendantAgeLessThan18);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=under-18-defendant');
    await I.see('You can’t use this service');
    await I.see('You can only use this service to claim against a defendant who’s 18 or over.');
    await I.see('You might be able to get advice from organisations like Citizens Advice (opens in a new window) about making a claim.');
    await this.eligibilityCantUseThisServiceAddress();
    await I.amOnPage('/eligibility/defendant-age');

    await I.waitForContent('Do you believe the person you’re claiming against is 18 or over?');
    await I.click(fields.defendantAgeAgainstComp);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/over-18');
    await I.amOnPage('/eligibility/defendant-age');
  }

  async eligibilityDefendantAge() {
    await I.waitForContent('Do you believe the person you’re claiming against is 18 or over?');
    await I.click(fields.defendantAge18);
    await I.click('Save and continue');
  }

  async eligibilityClaimantAgeValidations(){
    await I.seeInCurrentUrl('/eligibility/over-18');
    await I.waitForContent('Are you 18 or over?');
    await I.click(fields.claimantAgeLessThan18);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/not-eligible?reason=under-18');
    await I.see('You can’t use this service');
    await I.see('You need to be 18 or over to use this service.');
    await I.see('You might be able to get advice from organisations like , Citizens Advice (opens in a new window) , about making a claim.');
    await I.amOnPage('/eligibility/over-18');
  }

  async eligibilityClaimantAge() {
    await I.waitForContent('Are you 18 or over?');
    await I.click(fields.claimantAge18);
    await I.click('Save and continue');
  }

  async eligibilityForHWF(){
    await I.seeInCurrentUrl('/eligibility/help-with-fees');
    await I.waitForContent('Do you need help paying your court fee?');
    await I.see('You could get financial help with court fees if you have little or no savings, are on a low income or get certain benefits.');
    await I.click(fields.hwfReferenceYes);
    await I.click('Save and continue');
  }

  async eligibilityInfoAboutHWF(){
    await I.seeInCurrentUrl('/eligibility/information-about-help-with-fees');
    await I.waitForContent('Some useful information about Help with Fees');
    await I.see('Making an application for Help with Fees does not guarantee that you will get your fee covered.');
    await I.see('You may still have to pay some or all of your court fee to get the claim issued (for the court system to officially start the claim and send details to the other side).');
    await I.see('When you apply for Help with Fees, you should receive an update from us within 5 working days, giving you the result of your application.');
    await I.see('If you want to apply for Help with Fees, you will complete an online form in a new window.');
    await I.see('This will give you a reference number. Please note the number and keep it safe, as you will need it later in the claim process.');
    await I.see('(NB: if you have more than one claim going on, each claim must have a separate Help with Fees application and reference number).');
    await I.see('You can send in your claim as soon as you have the Help with Fees reference number, but the claim will not be issued until the Help with Fees application has been processed by the court.');
    await I.see('This is so that you will know what fees are covered and what you still have to pay. If you choose not to pay, the claim will not be issued.');
    await I.see('The claim will stop here unless you change your mind within 95 days.');
    await I.see('You may be asked by the court to email evidence in support of your application before your claim is issued.');
    await I.see('Do you wish to continue to make a Help with Fees Application?');
    await I.click(fields.hwfReferenceYes);
    await I.click('Save and continue');
  }

  async eligibilityApplyForHWF(){
    await I.seeInCurrentUrl('/eligibility/apply-for-help-with-fees');
    await I.waitForContent('Apply For Help With Fees');
    await I.see('If you have already applied for Help with Fees in respect of');
    await I.see('THIS CLAIM,');
    await I.see('you may already have a reference number.');
    await I.see('If so, you can save and continue and enter it when asked.');
    await I.see('Do not use a Help With Fees reference number related a different claim or to any application fees.');
    await I.see('It will be invalid as you cannot use the same Help with Fees reference number twice.');
    await I.see('If you do not have a Help with Fees reference number for this claim,');
    await I.see('you should make a Help with Fees application which will provide you with a reference number.');
    await I.seeElement('//a[@href=\'https://www.gov.uk/get-help-with-court-fees\']');
    await I.see('If you need to use the paper Help with Fees application rather than the online version,');
    await I.see('you will not be able to use Online Civil Money Claims to issue your claim.');
    await I.see('When you apply for Help with Fees you will be asked for the number on your court or tribunal form.');
    await I.see('Please note that this is form N1.');
    await I.see('When you have completed your Help with Fees application,');
    await I.see('you will be given a reference number (For example HWF-C2D-45E).');
    await I.see('Please note the number and keep it safe.');
    await I.see('You will need it later in the claim process.');
    await I.see('Then return to this page and click the Save and continue box below so that you can start the claim.');
    await I.click('Save and continue');
  }

  async eligibilityHWFReferenceValidations(){
    await I.seeInCurrentUrl('/eligibility/help-with-fees-reference');
    await I.waitForContent('Do you have a Help With Fees reference number?');
    await I.see('You’ll only have one if you’ve already applied for Help with Fees in respect of this claim.');
    await I.click(fields.hwfReferenceYes);
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/hwf-eligible-reference');
    await I.see('You can use this service');
    await I.see('Based on your answers you can make a money claim using this service.');
    await I.see('Remember that you will not know about the fee until we have processed your Help with Fees application. Your claim will only be issued after Help with Fees is confirmed, or the fee is paid.');
  }

  async eligibilityHWFReference() {
    await I.waitForContent('Do you have a Help With Fees reference number?');
    await I.click(fields.hwfReferenceNo);
    await I.waitForContent('Decide whether to apply for Help with Fees');
    await I.seeElement('//a[contains(normalize-space(), \'Apply for Help with Fees (opens in a new window)\')]');
    await I.see('and make a claim using a Help with Fees number. If you need to use the paper Help with Fees application rather than the online version then you will not be able to use Online Civil Money Claims to issue your claim.');
    await I.see('When you apply for Help with Fees you will be asked for the number on your court or tribunal form. Please note that this is N1.');
    await I.see('Make a note of the Help with Fees number when you make an application.');
    await I.see('You will need this number to make your claim when you are returned to this service.');
    await I.click('Save and continue');
    await I.seeInCurrentUrl('/eligibility/hwf-eligible');
    await I.see('You can use this service');
    await I.see('Based on your answers you can make a money claim using this service.');
    await I.see('You will have to pay court fees unless you are eligible for Help with Fees.');
    await I.seeElement('//a[contains(normalize-space(), \'Find out more about Help with Fees (opens in a new window)\')]');
    await I.click('Continue');
  }

  async eligibilityCantUseThisServiceAddress(){
    await I.see('Where to send paper forms');
    await I.see('County Court Money Claims Centre');
    await I.see('PO Box 527');
    await I.see('Salford');
  }
}

module.exports = EligibilityCheck;
