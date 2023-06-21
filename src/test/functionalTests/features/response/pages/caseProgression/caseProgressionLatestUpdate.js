const I = actor();

class CaseProgressionLatestUpdate {

  open(claimRef) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.verifyLatestUpdatePageContent();
    I.click('Upload documents');
  }

  verifyLatestUpdatePageContent() {
    I.see('Test Inc v Sir John Doe', 'h1');
    I.see('Claim number: ');
    I.see('Latest update');
    I.see('Documents');
    I.see('A trial has been scheduled for your case', 'h3');
    //TODO - Include the hearing date in the relevant Format
    I.see('Your trial has been scheduled for');
    I.see('at Central London County Court.');
  }
}

module.exports = CaseProgressionLatestUpdate;
