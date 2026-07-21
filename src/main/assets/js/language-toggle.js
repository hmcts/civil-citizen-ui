const languageElement = document.getElementsByClassName('language');

function getUpdatedQuery(query, language) {
  const toggleLang = language === 'en' ? 'cy' : 'en';
  if (query.includes('lang')) {
    return query.replace(`lang=${language}`, `lang=${toggleLang}`);
  } else if (query) {
    return `${query}&&lang=${toggleLang}`;
  } else if (!query) {
    return `?lang=${toggleLang}`;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const lang = document.documentElement.lang || 'en';

  const query = window.location.search;
  const toggleLangText = lang === 'en' ? 'Cymraeg' :'English';
  let updatedQuery = getUpdatedQuery(query, lang);
  languageElement[0].href = updatedQuery;
  languageElement[0].textContent = toggleLangText;
});
