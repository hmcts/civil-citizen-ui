import {resetFields, reindex, removeSummaryLinks, focusItem} from './repeated-row-utils.js';
import {getCalculation, addCalculationEventListener} from './calculate-amount.js';
import {populateTotalClaimAmount, addTotalClaimAmountCalculationEventListener} from './calculate-total-amount.js';

// Adapted from the fork's explicit initialiser. The legacy markup stays separate
// from CUI rows; only a declared editor may own its controls and clone sources.
const ROOT = '[data-module="cui-append-row"]';
const boundRoots = new WeakSet();

export function initAppendRow(scope = document, initControls) {
  const roots = [...scope.querySelectorAll(ROOT)];
  if (scope.matches?.(ROOT)) roots.unshift(scope);
  roots.forEach(root => {
    if (boundRoots.has(root) || !root.dataset.rowNamePrefix) return;
    const owned = element => element.closest(ROOT) === root;
    const add = [...root.querySelectorAll('.append-row')].find(owned);
    const selector = root.dataset.rowSelector || '.row-container';
    const rows = () => [...root.querySelectorAll(selector)].filter(owned);
    if (!add || !rows().length || rows().some(row => row.closest('[data-module="cui-add-another"]'))) return;
    const prefix = root.dataset.rowNamePrefix;
    const rowIndex = name => {
      if (!name?.startsWith(`${prefix}[`)) return undefined;
      const value = name.slice(prefix.length + 1).split(']')[0];
      return /^\d+$/.test(value) ? value : undefined;
    };
    const prepare = row => {
      const field = [...row.querySelectorAll('[name]')].find(field => rowIndex(field.name) !== undefined);
      if (!field) return false;
      const old = rowIndex(field.name), before = `${prefix}[${old}]`;
      row.dataset.rowIndex = old;
      row.dataset.indexIdPrefixes = root.dataset.rowIdPrefixes || '[]';
      row.querySelectorAll('[name]').forEach(field => {
        if (field.name.startsWith(before)) field.dataset.name = `${prefix}[%index%]${field.name.slice(before.length)}`;
      });
      return true;
    };
    if (!rows().every(prepare)) return;
    boundRoots.add(root);
    const update = () => {
      add.hidden = false;
      rows().forEach(row => row.querySelectorAll('.remove-row').forEach(button => {
        const unavailable = rows().length <= 1;
        button.hidden = unavailable;
        button.disabled = unavailable;
        button.classList.toggle('govuk-!-display-none', unavailable);
      }));
    };
    const calculate = () => {
      const form = root.closest('form') || root;
      populateTotalClaimAmount(form);
      if (form.querySelector('.total-monthly-income-expense')) getCalculation(form).catch(error => console.error(error));
    };
    root.addEventListener('click', event => {
      if (event.target.nodeType !== 1 || !owned(event.target)) return;
      const addButton = event.target.closest('.append-row'), remove = event.target.closest('.remove-row');
      if (addButton === add) {
        event.preventDefault();
        const current = rows(), source = current[current.length - 1], clone = source.cloneNode(true);
        resetFields(clone);
        source.parentNode.insertBefore(clone, source.nextSibling);
        reindex(root, rows(), clone);
        initControls?.(clone);
        update();focusItem(clone, add);calculate();
      } else if (remove) {
        const current = rows(), item = current.find(row => row.contains(remove));
        if (!item) return;
        event.preventDefault();
        if (current.length <= 1) return;
        const index = current.indexOf(item);
        removeSummaryLinks(root, item);item.remove();reindex(root, rows());
        update();focusItem(rows()[Math.min(index, rows().length - 1)], add);calculate();
      }
    });
    reindex(root, rows());update();
    addCalculationEventListener(root);addTotalClaimAmountCalculationEventListener(root);
  });
}
