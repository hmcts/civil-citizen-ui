
const I = actor();

const fields ={
  skip_this_section: '//a[contains(.,\'Skip this section\')]'
};

class DoNotAgreeToFreeMediation {

  skipReasonForMediation(claimRef) {
    I.amOnPage('/case/'+claimRef+'/mediation/i-dont-want-free-mediation');
    I.see('I do not agree to free mediation', 'h1');
    I.click(fields.skip_this_section);
  }
}

module.exports = DoNotAgreeToFreeMediation;
