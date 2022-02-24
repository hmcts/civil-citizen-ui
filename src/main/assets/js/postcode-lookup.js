(function () {
  document.querySelector('#conditional-enter-address-manually')
    .addEventListener('click', function (event) {
      event.preventDefault();
      this.classList.add('govuk-visually-hidden');
      document.querySelector('#correspondence-address').classList.remove('govuk-visually-hidden');
    });
})();
