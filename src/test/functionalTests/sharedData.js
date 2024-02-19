class SharedData {
  language = 'en';

  updateLanguage(language) {
    this.language = language;
  }
}

module.exports = new SharedData();