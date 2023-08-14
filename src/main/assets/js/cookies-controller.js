/**
 * This code controls displaying success notification banner on cookies page after successfulyy saving cookies preferences
 */

if (document.getElementById('cui-cookies-submit')) {
  document.getElementById('cui-cookies-submit').addEventListener('click', () => {
    [...document.getElementsByClassName('govuk-notification-banner--success')].forEach((element) => {
      element.classList.remove('govuk-visually-hidden');
    });
  });
}
