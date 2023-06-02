
const I = actor();

const fields ={
  continueWithExpert: 'input[id="expertYes"]',
  continueWithoutExpert: 'button.govuk-button',
};

class DqExpert {

  chooseExpert(option = 'Yes') {
    I.see('Using an expert', 'h1');
    switch(option){
      case 'Yes':{
        I.click(fields.continueWithExpert);
        break;
      }
      case 'No':{
        I.click(fields.continueWithoutExpert);
        break;
      }
      default:
        I.click(fields.continueWithExpert);
    }
  }
}

module.exports = DqExpert;
