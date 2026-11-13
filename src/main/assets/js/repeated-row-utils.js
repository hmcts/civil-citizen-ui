// Shared bounded row operations for the two existing DOM contracts.
export function resetFields(item) {
  const removedIds = new Set([...item.querySelectorAll('.govuk-error-message, .govuk-error-summary')].map(error => error.id));
  // New controls have no listeners even when cloned from enhanced markup.
  item.querySelectorAll('[data-module^="govuk-"]').forEach(module => {
    module.removeAttribute(`data-${module.dataset.module}-init`);
  });
  item.querySelectorAll('input[type="checkbox"][aria-controls], input[type="radio"][aria-controls]').forEach(input => {
    input.setAttribute('data-aria-controls', input.getAttribute('aria-controls'));
    input.removeAttribute('aria-controls');
    input.removeAttribute('aria-expanded');
  });
  item.querySelectorAll('[data-clone-id]').forEach(element => { element.dataset.id = element.dataset.cloneId; });
  item.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.name === '_csrf') {
      field.remove();
    } else if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = false;
      field.defaultChecked = false;
    } else if (!['button', 'submit'].includes(field.type)) {
      field.value = '';
      if (field.tagName === 'SELECT') {
        [...field.options].forEach(option => { option.defaultSelected = false; });
        field.selectedIndex = 0;
      } else {
        field.defaultValue = '';
      }
    }
  });
  item.querySelectorAll('.govuk-error-message, .govuk-error-summary').forEach(error => error.remove());
  item.querySelectorAll('*').forEach(element => {
    element.classList.remove('govuk-form-group--error', 'govuk-input--error', 'govuk-select--error', 'govuk-textarea--error');
    element.removeAttribute('aria-invalid');
    element.removeAttribute('data-select-toggle-bound');
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      element.setAttribute('aria-describedby', describedBy.split(/\s+/).filter(id => !removedIds.has(id)).join(' '));
    }
  });
}

export function reindex(root, items, addedItem) {
  const summaryIds = new Map();
  items.forEach((item, index) => {
    // Only indexes belonging to the row's explicit field contract are changed.
    const prefixes = new Map();
    item.querySelectorAll('[data-name]').forEach(field => {
      const template = field.dataset.name.match(/^(.*?\[)%index%]/);
      const actual = field.getAttribute('name')?.match(/^(.*?\[)(\d+)]/);
      if (template && actual && template[1] === actual[1]) {
        prefixes.set(actual[0], `${template[1]}${index}]`);
      }
    });
    const indexed = value => {
      for (const [before, after] of prefixes) {
        if (value.startsWith(before)) return after + value.slice(before.length);
      }
      return value;
    };
    // Explicit row metadata handles GOV.UK-generated IDs whose contract differs
    // from submitted names (for example declared-0-otherSupport).
    const idPrefixes = JSON.parse(item.dataset.indexIdPrefixes || '[]');
    const indexedId = value => {
      for (const template of idPrefixes) {
        const before = template.replaceAll('%index%', item.dataset.rowIndex);
        if (value.startsWith(before)) return template.replaceAll('%index%', String(index)) + value.slice(before.length);
      }
      return indexed(value);
    };
    const ids = new Map();
    item.querySelectorAll('[id]').forEach(element => {
      const before = element.id;
      element.id = element.dataset.id?.replaceAll('%index%', String(index)) || indexedId(before);
      ids.set(before, element.id);
    });
    item.querySelectorAll('[name]').forEach(field => {
      field.setAttribute('name', field.dataset.name?.replaceAll('%index%', String(index)) || indexed(field.getAttribute('name')));
    });
    item.querySelectorAll('[data-value]').forEach(button => {
      button.value = button.dataset.value.replaceAll('%index%', String(index));
    });
    item.querySelectorAll('*').forEach(element => {
      for (const attribute of ['for', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'data-aria-controls', 'headers', 'data-error-target']) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, value.split(/\s+/).map(id => ids.get(id) || id).join(' '));
      }
    });
    item.querySelectorAll('a[href^="#"]').forEach(link => {
      const id = link.getAttribute('href').slice(1);
      if (ids.has(id)) link.setAttribute('href', `#${ids.get(id)}`);
    });
    item.querySelectorAll('[data-row-number]').forEach(number => { number.textContent = String(index + 1); });
    item.querySelectorAll('[data-row-label-template]').forEach(label => { label.textContent = label.dataset.rowLabelTemplate.replaceAll('%row%', String(index + 1)); });
    [item, ...item.querySelectorAll('[data-row-aria-label-template]')].filter(element => element.hasAttribute('data-row-aria-label-template')).forEach(field => { field.setAttribute('aria-label', field.dataset.rowAriaLabelTemplate.replaceAll('%row%', String(index + 1))); });
    if (item.hasAttribute('data-row-index')) item.dataset.rowIndex = String(index);
    if (item !== addedItem) ids.forEach((after, before) => summaryIds.set(before, after));
  });
  root.ownerDocument.querySelectorAll('.govuk-error-summary a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href').slice(1);
    if (summaryIds.has(id)) link.setAttribute('href', `#${summaryIds.get(id)}`);
  });
  retargetSummaryLinks(root);
}

export function retargetSummaryLinks(root) {
  root.querySelectorAll('[id][data-error-target]').forEach(group => {
    const target = root.ownerDocument.getElementById(group.dataset.errorTarget);
    if (!target || !root.contains(target)) return;
    root.ownerDocument.querySelectorAll('.govuk-error-summary a[href^="#"]').forEach(link => {
      if (link.getAttribute('href').slice(1) === group.id) link.setAttribute('href', `#${target.id}`);
    });
  });
}

export function removeSummaryLinks(root, item) {
  const ids = new Set([...item.querySelectorAll('[id]')].map(element => element.id));
  const affectedSummaries = new Set();
  root.ownerDocument.querySelectorAll('.govuk-error-summary a[href^="#"]').forEach(link => {
    if (ids.has(link.getAttribute('href').slice(1))) {
      const entry = link.closest('li');
      if (entry) {
        affectedSummaries.add(link.closest('.govuk-error-summary'));
        entry.remove();
      }
    }
  });
  affectedSummaries.forEach(summary => {
    if (!summary.querySelector('.govuk-error-summary__list li')) summary.remove();
  });
}

export function focusItem(item, fallback) {
  const field = [...item.querySelectorAll('input:not([type="hidden"]), select, textarea')]
    .find(element => !element.disabled && !element.readOnly && !element.closest('[hidden], .govuk-radios__conditional--hidden, .govuk-checkboxes__conditional--hidden, [class~="govuk-!-display-none"]'));
  const target = field || fallback;
  if (!target.closest('[hidden], .govuk-radios__conditional--hidden, .govuk-checkboxes__conditional--hidden')) target.focus();
}
