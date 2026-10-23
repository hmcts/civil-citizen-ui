import {initSelectToggle} from './select-toggle.js';

// Adapted from the improvements fork. Only explicitly owned, client-managed
// roots are enhanced; upload forms and append-row stay independent.
const ROOT = '[data-module="cui-add-another"]';
const ITEM = '.cui-add-another__item';
const boundRoots = new WeakSet();

export function initAddAnother(scope = document) {
  const roots = [...scope.querySelectorAll(ROOT)];
  if (scope.matches?.(ROOT)) roots.unshift(scope);
  roots.forEach(bindRoot);
}

function bindRoot(root) {
  const container = root.querySelector('.cui-add-another__items');
  const addButton = root.querySelector('.cui-add-another__add-button');
  if (!container || !addButton || boundRoots.has(root)) return;
  if (container.closest(ROOT) !== root || addButton.closest(ROOT) !== root) return;
  const items = () => [...container.children].filter(item => item.matches(ITEM));
  if (!items().length) return;
  boundRoots.add(root);
  const minimum = Math.max(1, Number(root.dataset.minItems || 1));
  const maximum = Number(root.dataset.maxItems || Infinity);

  const updateControls = () => {
    const count = items().length;
    addButton.hidden = false;
    addButton.disabled = count >= maximum;
    items().forEach((item, index) => {
      item.querySelectorAll('[data-row-number]').forEach(number => { number.textContent = String(index + 1); });
      const remove = item.querySelector('.cui-add-another__remove-button');
      if (remove) {
        remove.hidden = count <= minimum;
        remove.disabled = count <= minimum;
      }
    });
  };

  root.addEventListener('click', event => {
    if (event.target.nodeType !== 1 || event.target.closest(ROOT) !== root) return;
    const add = event.target.closest('.cui-add-another__add-button');
    const remove = event.target.closest('.cui-add-another__remove-button');
    if (add) {
      event.preventDefault();
      if (items().length >= maximum) return;
      const clone = items()[0].cloneNode(true);
      resetFields(clone);
      container.appendChild(clone);
      reindex(root, items(), clone);
      initSelectToggle(clone);
      updateControls();
      focusItem(clone, addButton);
    } else if (remove) {
      event.preventDefault();
      const current = items();
      const item = remove.closest(ITEM);
      if (current.length <= minimum || !current.includes(item)) return;
      const index = current.indexOf(item);
      removeSummaryLinks(root, item);
      item.remove();
      reindex(root, items());
      updateControls();
      focusItem(items()[Math.min(index, items().length - 1)], addButton);
    }
  });
  reindex(root, items());
  initSelectToggle(root);
  updateControls();
}

function resetFields(item) {
  const removedIds = new Set([...item.querySelectorAll('.govuk-error-message, .govuk-error-summary')].map(error => error.id));
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

function reindex(root, items, addedItem) {
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
    const ids = new Map();
    item.querySelectorAll('[id]').forEach(element => {
      const before = element.id;
      element.id = element.dataset.id?.replaceAll('%index%', String(index)) || indexed(before);
      ids.set(before, element.id);
    });
    item.querySelectorAll('[name]').forEach(field => {
      field.setAttribute('name', field.dataset.name?.replaceAll('%index%', String(index)) || indexed(field.getAttribute('name')));
    });
    item.querySelectorAll('[data-value]').forEach(button => {
      button.value = button.dataset.value.replaceAll('%index%', String(index));
    });
    item.querySelectorAll('*').forEach(element => {
      for (const attribute of ['for', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'headers']) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, value.split(/\s+/).map(id => ids.get(id) || id).join(' '));
      }
    });
    if (item !== addedItem) ids.forEach((after, before) => summaryIds.set(before, after));
  });
  root.ownerDocument.querySelectorAll('.govuk-error-summary a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href').slice(1);
    if (summaryIds.has(id)) link.setAttribute('href', `#${summaryIds.get(id)}`);
  });
}

function removeSummaryLinks(root, item) {
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

function focusItem(item, fallback) {
  const field = [...item.querySelectorAll('input:not([type="hidden"]), select, textarea')]
    .find(element => !element.disabled && !element.readOnly && !element.closest('[hidden]'));
  (field || fallback).focus();
}
