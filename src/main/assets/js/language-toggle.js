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

function getUpdateQuery(query, language) {
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
  const query = window.location.search;
  const lang = getCookie('lang');
  let updatedQuery = getUpdateQuery(query, lang);
  languageElement[0].href = updatedQuery;
  if (lang === 'cy') {
    languageElement[0].textContent = 'English';
  } else {
    languageElement[0].textContent = 'Welsh';
  }
});