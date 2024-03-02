class SharedData {
  #language = 'en';

  set language(language) {
    if(['en', 'cy'].includes(language) === false) {
      throw new Error('Language chosen must either be \'en\' or \'cy\'');
    }
    this.#language = language;
  }

  get language()  {
    return this.#language;
  }
}

module.exports = new SharedData();
