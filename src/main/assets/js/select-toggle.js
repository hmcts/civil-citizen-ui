// Native DOM approach adapted from the fork. Delegation survives cloned rows;
// initialisation updates visibility without clearing saved descriptions.
const boundDocuments = new WeakSet();

export function initSelectToggle(scope = document) {
  const documentRoot = scope.ownerDocument || scope;
  if (!boundDocuments.has(documentRoot)) {
    documentRoot.addEventListener('change', event => {
      if (event.target.matches?.('.select-toggle .govuk-select')) updatePanel(event.target, true);
    });
    boundDocuments.add(documentRoot);
  }
  scope.querySelectorAll('.select-toggle .govuk-select, .cui-add-another__item .govuk-select').forEach(select => updatePanel(select, false));
}

function updatePanel(select, changed) {
  const row = select.closest('.cui-add-another__item, .moj-add-another__item') || select.closest('.select-toggle');
  const panel = row?.querySelector('.panel');
  if (!panel) return;
  const textarea = panel.querySelector('textarea');
  if (changed && textarea) textarea.value = '';
  panel.hidden = !select.value && !textarea?.value && !panel.querySelector('.govuk-error-message');
  panel.classList.remove('govuk-visually-hidden');
  panel.querySelectorAll('[data-evidence-type]').forEach(hint => {
    const active = hint.dataset.evidenceType === select.value;
    hint.hidden = !active;
    hint.classList.toggle('govuk-visually-hidden', !active);
  });
}
