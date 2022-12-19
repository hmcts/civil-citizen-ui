const I = actor();

const fields = {
  moreThan28Days: '#option-2',
};

const buttons = {
  continue: 'button.govuk-button',
};

class RequestMoreTime {

  open(claimRef) {
    I.amOnPage('/case/' + claimRef + '/response/request-more-time');
  }

  verifyResponsePageContent() {    
    I.see('Request more time to respond');
  }
   
  requestMoreTimeToRespond(claimRef) {
    this.open(claimRef);
    I.click(fields.moreThan28Days);
    I.click(buttons.continue);    
  }

}

module.exports = RequestMoreTime;