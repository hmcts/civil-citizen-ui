// Uploads remain server-managed. Remember only the action and page, never file
// contents/references, so a server redisplay can return focus to the affected row.
const boundForms = new WeakSet();
const storageKey = 'cui-upload-action';

export function initUploadRows(scope = document) {
  // Existing single-file forms use an empty-property validation error when no
  // document has been saved. Give that summary link a usable file destination.
  scope.querySelectorAll('input[type="file"][name="selectedFile"]').forEach(file => {
    scope.querySelectorAll('.govuk-error-summary a[href="#"]').forEach(link => link.setAttribute('href', `#${file.id}`));
  });
  const roots = [...scope.querySelectorAll('[data-module="cui-upload-rows"]')];
  roots.forEach(root => {
    // Date validation uses the submitted day name; the established day ID ends
    // in [date]. Keep both contracts and point the summary at the owned input.
    root.querySelectorAll('input[name$="[dateInputFields][dateDay]"][id]').forEach(day => {
      scope.querySelectorAll('.govuk-error-summary a[href]').forEach(link => {
        if (link.getAttribute('href') === `#${day.name}`) {
          link.setAttribute('href', `#${day.id}`);
        }
      });
    });
    root.querySelectorAll('input[type="file"]').forEach(file => {
      scope.querySelectorAll('.govuk-error-summary a[href]').forEach(link => {
        if (['size', 'mimetype', 'buffer'].some(field => link.getAttribute('href') === `#${file.id}[${field}]`)) {
          link.setAttribute('href', `#${file.id}`);
        }
      });
    });
  });
  const forms = new Set(roots.map(root => root.closest('form')).filter(Boolean));
  forms.forEach(form => {
    if (boundForms.has(form)) return;
    boundForms.add(form);
    form.addEventListener('submit', event => {
      const button = event.submitter;
      // A native redisplay cannot restore a selected file. Require the existing
      // Save file step before Add/Remove/Continue can navigate away from it.
      if (!button?.value?.endsWith('[uploadButton]')) {
        const pending = [...form.querySelectorAll('[data-module="cui-upload-rows"] input[type="file"]')].find(file => file.files?.length);
        if (pending) {
          event.preventDefault();
          const action = pending.name.replace(/\[fileUpload]$/, '[uploadButton]');
          [...form.querySelectorAll('button[name="action"]')].find(control => control.value === action)?.focus();
          return;
        }
      }
      const root = button?.closest('[data-module="cui-upload-rows"]');
      if (!root || button.name !== 'action') return;
      const match = button.value.match(/^([^[]+)\[(\d+)]\[(uploadButton|removeButton)]$/);
      const add = button.value.startsWith('add_another-');
      if (!match && !add) return;
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify({
          path: window.location.pathname,
          category: root.dataset.uploadCategory,
          index: match ? Number(match[2]) : undefined,
          add,
        }));
      } catch { /* Storage restrictions must not prevent native form submission. */ }
    });
  });
  if (!roots.length) return;
  try {
    const saved = window.sessionStorage.getItem(storageKey);
    if (!saved) return;
    const action = JSON.parse(saved);
    window.sessionStorage.removeItem(storageKey);
    if (action.path !== window.location.pathname || scope.querySelector('.govuk-error-summary')) return;
    const root = roots.find(item => item.dataset.uploadCategory === action.category);
    const rows = root?.querySelectorAll('.cui-upload-rows__item');
    if (!rows?.length) return;
    const index = action.add ? rows.length - 1 : Math.min(action.index, rows.length - 1);
    rows[index]?.querySelector('input:not([type="hidden"]), select, textarea, button')?.focus();
  } catch { /* Malformed or unavailable storage leaves the server page usable. */ }
}
