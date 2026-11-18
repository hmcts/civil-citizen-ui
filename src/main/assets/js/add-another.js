import {initSelectToggle} from './select-toggle.js';
import {resetFields, reindex, removeSummaryLinks, focusItem} from './repeated-row-utils.js';

// Adapted from the improvements fork. Only explicitly owned, client-managed
// roots are enhanced; upload forms and append-row stay independent.
const ROOT = '[data-module="cui-add-another"]';
const ITEM = '.cui-add-another__item';
const boundRoots = new WeakSet();

export function initAddAnother(scope = document, initControls) {
  const roots = [...scope.querySelectorAll(ROOT)];
  if (scope.matches?.(ROOT)) roots.unshift(scope);
  roots.forEach(root => bindRoot(root, initControls));
}

function bindRoot(root, initControls) {
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
      initControls?.(clone);
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
