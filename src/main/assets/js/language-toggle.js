const languageElement = document.getElementsByClassName('language');

const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim().split('=');
    if (c[0] === name) {
      return c[1];
    }
  }
  return '';
};

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
  const lang = getCookie('lang');

  document.documentElement.lang = lang;
  const query = window.location.search;
  const toggleLangText = lang === 'en' ? 'Cymraeg' :'English';
  let updatedQuery = getUpdatedQuery(query, lang);
  languageElement[0].href = updatedQuery;
  languageElement[0].textContent = toggleLangText;
});
