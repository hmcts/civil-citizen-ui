// Keep the existing calculation endpoint and schedules. Registration is delegated
// once per form, so adding rows cannot multiply listeners on existing controls.
const boundForms = new WeakSet();
const requests = new WeakMap();
const formFor = scope => scope?.closest?.('form') || (scope?.matches?.('form') ? scope : document.querySelector('.total-monthly-income-expense')?.closest('form'));

export function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

export function addCalculationEventListener(scope = document) {
  const forms = scope.matches?.('form') ? [scope] : scope.closest?.('form') ? [scope.closest('form')] : [...scope.querySelectorAll('form')];
  forms.forEach(form => {
    if (boundForms.has(form) || !form.querySelector('.total-monthly-income-expense')) return;
    boundForms.add(form);
    const calculate = () => getCalculation(form).catch(error => console.error(error));
    const delayed = debounce(calculate, 1000);
    form.addEventListener('keyup', event => { if (event.target.matches('.civil-amount')) delayed(); });
    form.addEventListener('input', event => { if (event.target.matches('.civil-amount')) delayed(); });
    form.addEventListener('change', event => {
      if (event.target.matches('.civil-schedule input, .govuk-checkboxes__input, .civil-amount')) calculate();
    });
  });
}

export async function getCalculation(scope = document) {
  const form = formFor(scope);
  const total = form?.querySelector('.total-monthly-income-expense'), csrf = form?.querySelector('[name="_csrf"]');
  if (!total || !csrf) return;
  const sequence = (requests.get(form) || 0) + 1;
  requests.set(form, sequence);
  const amounts = [];
  form.querySelectorAll('.civil-amountRow').forEach(row => {
    const amount = row.querySelector('.civil-amount'), selected = row.querySelector('.civil-schedule input:checked');
    const category = amount?.name.match(/^model\[([^\]]+)]/)?.[1];
    const declaration = [...form.querySelectorAll('input[name="declared"]')].find(input => input.value === category);
    const active = declaration ? declaration.checked : !row.closest('.govuk-checkboxes__conditional--hidden');
    if (active && amount?.value && selected?.value) amounts.push({amount: amount.value, schedule: selected.value});
  });
  if (!amounts.length) {total.textContent = '0';return;}
  const response = await fetch('/total-income-expense-calculation', {
    method: 'POST', headers: {'Content-Type': 'application/json', 'CSRF-Token': csrf.value}, body: JSON.stringify(amounts),
  });
  const data = await response.json();
  if (requests.get(form) === sequence) total.textContent = data;
}

document.addEventListener('DOMContentLoaded', () => {
  addCalculationEventListener();
  document.querySelectorAll('form').forEach(form => {
    if (form.querySelector('.total-monthly-income-expense')) getCalculation(form).catch(error => console.error(error));
  });
});
