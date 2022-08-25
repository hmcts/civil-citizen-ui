const language = document.getElementsByClassName('language');

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
  const query = window.location.search;
  const lang = getCookie('lang');
  let updatedQuery;
  if (lang === 'cy') {
    if (query.includes('lang=cy')) {
      updatedQuery = query.replace('lang=cy', 'lang=en');
    } else if (query) {
      updatedQuery = query + '&&lang=en';
    } else if (!query) {
      updatedQuery = '?lang=en';
    }
    language[0].textContent = 'English';
    language[0].href= updatedQuery;
  } else {
    if (query.includes('lang=en')) {
      updatedQuery = query.replace('lang=en', 'lang=cy');
    } else if (query) {
      updatedQuery = query + '&&lang=cy';
    } else if (!query) {
      updatedQuery = '?lang=cy';
    }
    language[0].textContent = 'Welsh';
    language[0].href = updatedQuery;
  }
});

