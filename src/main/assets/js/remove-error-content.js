// Keep the MOJ clone workaround local to newly inserted legacy rows. Observing
// the whole document also removed errors and upload displays from existing rows.
document.querySelectorAll('[data-module="moj-add-another"]').forEach(root => {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(item => {
        if (item.nodeType !== 1 || !item.matches('.moj-add-another__item')
          || item.closest('[data-module="moj-add-another"]') !== root) return;
        item.querySelector('[id*="-loadingContainer"]')?.remove();
        item.querySelector('[id*="[documentName]"]')?.remove();
        item.querySelectorAll('.govuk-error-summary, .govuk-error-message').forEach(error => error.classList.add('hide'));
        item.querySelectorAll('.govuk-input--error').forEach(field => field.classList.remove('govuk-input--error'));
        item.querySelectorAll('.govuk-form-group--error').forEach(group => group.classList.remove('govuk-form-group--error'));
      });
    });
  });
  observer.observe(root, {childList: true, subtree: true});
});
