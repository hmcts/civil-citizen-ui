class SharedData {
  #language = 'en';
  #testFilePath = './specClaimHelpers/fixtures/examplePDF.pdf';

  set language(language) {
    if(['en', 'cy'].includes(language) === false) {
      throw new Error('Language chosen must either be \'en\' or \'cy\'');
    }
    this.#language = language;
  }

  get language()  {
    return this.#language;
  }

  get testFilePath()  {
    return this.#testFilePath;
  }
}

module.exports = new SharedData();
