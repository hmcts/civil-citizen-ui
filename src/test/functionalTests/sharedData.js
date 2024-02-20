class SharedData {
    #language = 'en'

    set language(language) {
        if(language in ['en', 'cy'] === false) {
            throw new Error('Language chosen must either be \'en\' or \'cy\'');
        }
        this.#language = language;
    };   

    get language()  {
        return this.#language;
    }
}

module.exports = new SharedData();