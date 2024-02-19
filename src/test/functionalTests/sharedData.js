const sharedData = {
    language: 'en'
};

const updateLanguage = (language) => {
    sharedData.language = language;
};   

module.exports = {
    sharedData,
    updateLanguage,
};