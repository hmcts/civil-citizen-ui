const I = actor();

class CheckYourAnswers {
  async verifyContent() {
    await I.see('Upload translated document', 'h1');
    await I.see('Check your answers', 'h2');
    await I.see('Translated Document');
    await I.see('Translated Document 1');
    await I.see('Document Type');
    await I.see('Defendant Response');
  }

  async submit() {
    I.click('Submit');
  }
}

module.exports = new CheckYourAnswers();