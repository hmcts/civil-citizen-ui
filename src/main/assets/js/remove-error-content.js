/**
 * This is a workaround for https://github.com/ministryofjustice/moj-frontend/issues/343.
 * The logic below may have to be adjusted if future repeated/added items have different error classes.
 * Future CCUI pages using MoJ add-another component will automatically benefit from this logic
 * Once the issue above addressed, MoJ library can be upgraded and this workaround can be discarded.
 */

if (document.getElementsByClassName('moj-add-another__add-button')) {
  const mutationObserver = new MutationObserver((mutations) => {
    const newBlock = mutations
      .filter((mutation) => mutation.type === 'childList')
      .findLast((mutation) => mutation);
    newBlock?.addedNodes.forEach((el) => {
      if (el?.children) {
        removeLoading(el);
        removeDocumentFile(el);
        [...el.getElementsByClassName('govuk-error-summary')].forEach(errorSummary => errorSummary.classList.add('hide'));
        [...el.getElementsByClassName('govuk-error-message')].forEach(errorMessage => errorMessage.classList.add('hide'));
        [...el.getElementsByClassName('govuk-input--error')].forEach(inputError => inputError.classList.remove('govuk-input--error'));
        [...el.getElementsByClassName('govuk-form-group--error')].forEach(groupError => groupError.classList.remove('govuk-form-group--error'));
      }
    });
  });

  mutationObserver.observe(document.documentElement, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  });
}

function removeLoading(node) {
  const loadingContainer  = node.querySelector('[id*="-loadingContainer"]');
  if (loadingContainer) {
    loadingContainer.remove();
  }
}
function removeDocumentFile(node) {
  const documentNameContainer  = node.querySelector('[id*="[documentName]"]');
  if (documentNameContainer) {
    documentNameContainer.remove();
  }
}
