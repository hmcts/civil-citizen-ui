const englishLanguage = document.getElementsByClassName('english-language');
const cymraegLanguage = document.getElementsByClassName('cymraeg-language');

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

document.addEventListener('DOMContentLoaded', function () {
  debugger;
  const currentQuery = window.location.search;
  const lang = getCookie('lang');
  if (lang === 'cy') {
    const updatedQuery = currentQuery.includes('lang')
      ? currentQuery.replace('lang=cy', 'lang=en')
      : currentQuery
      ? currentQuery + '&&lang=en'
        : '?lang=en';
    englishLanguage[0].href = updatedQuery;
    englishLanguage[0].className = 'govuk-!-font-size-19 govuk-link language';
    cymraegLanguage[0].className = 'govuk-!-display-none';
  } else {
    const updatedQuery = currentQuery.includes('lang')
      ? currentQuery.replace('lang=en", "lang=cy')
      : currentQuery
        ? currentQuery + '&&lang=cy'
        : '?lang=cy';
    englishLanguage[0].className = 'govuk-!-display-none';
    cymraegLanguage[0].href = updatedQuery;
    cymraegLanguage[0].className = 'govuk-!-font-size-19 govuk-link language';
  }
});
