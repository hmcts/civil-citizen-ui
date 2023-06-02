
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class GiveEvidenceYourself {

  SelectGiveEvidenceYourself(option = 'Yes') {
    I.see('Do you want to give evidence yourself?', 'h1');
    switch(option){
      case 'Yes':{
        I.click(fields.yesButton);
        break;
      }
      case 'No':{
        I.click(fields.noButton);
        break;
      }
      default:
        I.click(fields.yesButton);
    }
    I.click('Save and continue');
  }
}

module.exports = GiveEvidenceYourself;
