const I = actor();
const config = require('../../../../../config');

class ClaimantUpdate {
  async respondToClaim(claimRef) {
    I.amOnPage('/dashboard/' + claimRef + '/claimant');
    I.waitForContent('About claim', config.WaitForText);
    I.click('Respond to claim');
  }

  async startUploadDocs(claimRef) {
    I.amOnPage('/case/' + claimRef + '/mediation/start-upload-documents');
    let url = await I.grabCurrentUrl();
    //Check if dashboard page appears
    if(url.includes('dashboard')){
      I.amOnPage('/case/' + claimRef + '/mediation/start-upload-documents');
    }
    I.waitForContent('Upload your documents', config.WaitForText);
    I.see('Deadlines for uploading documents');
    I.click('Start now');
  }
}

module.exports = ClaimantUpdate;
