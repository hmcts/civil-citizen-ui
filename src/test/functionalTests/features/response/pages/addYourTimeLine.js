const I = actor();

const fields = {
  date1: '#rows\\[0\\]\\[date\\]',
  whathappened1: '#rows\\[0\\]\\[description\\]', 
};

const buttons = {
  addAnotherAccount: 'Add another account',
  saveAndContinue: 'Save and continue',
};

class AddYourTimeLine {
  addTimeLineOfEvents() {
    I.see('Add your timeline of events', 'h1');
    I.fillField(fields.date1, '28 April 2022');    
    I.fillField(fields.whathappened1, 'TestTimeLine');    
    this.clickContinue();
  }

  clickContinue(){
    I.click(buttons.saveAndContinue);
  }
}

module.exports = AddYourTimeLine;
