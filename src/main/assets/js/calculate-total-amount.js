import {debounce} from './calculate-amount.js';

const boundForms = new WeakSet();
export function populateTotalClaimAmount(scope = document) {
  const form = scope.closest?.('form') || (scope.matches?.('form') ? scope : document.querySelector('.civil-claim-amount')?.closest('form'));
  const amounts = [...(form?.querySelectorAll('.civil-claim-amount') || [])];
  if (!amounts.length) return;
  const total = amounts.map(input => Number(input.value)).reduce((sum, amount) => sum + amount, 0).toFixed(2);
  form.querySelectorAll('.total-claim-amount').forEach(element => {
    if (element.type === 'hidden') element.value = total;
    else element.textContent = total;
  });
}
export function addTotalClaimAmountCalculationEventListener(scope = document) {
  const forms = scope.matches?.('form') ? [scope] : scope.closest?.('form') ? [scope.closest('form')] : [...scope.querySelectorAll('form')];
  forms.forEach(form => {
    if (boundForms.has(form) || !form.querySelector('.civil-claim-amount')) return;
    boundForms.add(form);
    const calculate = () => populateTotalClaimAmount(form), delayed = debounce(calculate, 1000);
    form.addEventListener('keyup', event => {if (event.target.matches('.civil-claim-amount')) delayed();});
    form.addEventListener('input', event => {if (event.target.matches('.civil-claim-amount')) delayed();});
    form.addEventListener('change', event => {if (event.target.matches('.civil-claim-amount')) calculate();});
  });
}
document.addEventListener('DOMContentLoaded', () => {
  addTotalClaimAmountCalculationEventListener();
  document.querySelectorAll('form').forEach(form => populateTotalClaimAmount(form));
});
