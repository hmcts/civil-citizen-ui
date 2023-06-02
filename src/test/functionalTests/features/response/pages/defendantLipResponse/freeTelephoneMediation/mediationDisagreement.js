
const I = actor();

const fields ={
  chose_not_try_mediation: '[value=\'no\']'
};

class MediationDisagreement {

  mediationDisagreement(claimRef) {
    I.amOnPage('/case/'+claimRef+'/mediation/mediation-disagreement');
    I.see('Advantages of free mediation', 'h2');
    I.click(fields.chose_not_try_mediation);
    I.click('Save and continue');
  }
}

module.exports = MediationDisagreement;
