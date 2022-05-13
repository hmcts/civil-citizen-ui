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
  return "";
}

document.addEventListener('DOMContentLoaded', function () {
  const lang = getCookie('lang');
  if (lang === 'cy') {
    englishLanguage[0].className = 'govuk-body govuk-link';
    cymraegLanguage[0].className = 'govuk-body govuk-link disabled-link';
  } else {
    englishLanguage[0].className = 'govuk-body govuk-link disabled-link';
    cymraegLanguage[0].className = 'govuk-body govuk-link';
  }
});
