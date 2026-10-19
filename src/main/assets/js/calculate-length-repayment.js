// Progressive enhancement of the existing repayment display. Validation and monetary
// rules remain on the server; this mirrors its display-only schedule mapping.
const initialised = new WeakSet();
export function initRepaymentLength(scope = document) {
  const total = scope.querySelector('.repayment-amount');
  const payment = scope.querySelector('.repayment-instalments');
  const frequency = scope.querySelector('.repayment-frequency');
  const count = scope.querySelector('#numberOfInstalments');
  const schedule = scope.querySelector('.schedule');
  const ids = ['week_schedule', 'weeks_schedule', 'two-weeks_schedule', 'month_schedule', 'months_schedule', 'two-months_schedule'];
  if (!total || !payment || !frequency || !count || !schedule || initialised.has(frequency)) return;
  const labels = ids.map(id => schedule.querySelector(`[id="${id}"]`));
  if (labels.some(label => !label)) return;
  initialised.add(frequency);
  const update = () => {
    labels.forEach(label => label.classList.add('hide'));
    count.textContent = '';
    const amount = parseFloat(total.value);
    const instalment = parseFloat(payment.value);
    const selected = frequency.querySelector('input[name="repaymentFrequency"]:checked')?.value;
    if (!Number.isFinite(amount) || !Number.isFinite(instalment) || amount <= 0 || instalment <= 0) return;
    let periods = Math.ceil(amount / instalment);
    if (selected === 'TWO_WEEKS') periods *= 2;
    let id;
    if (selected === 'WEEK' || selected === 'TWO_WEEKS') {
      id = periods === 1 ? 'week_schedule' : periods === 2 ? 'two-weeks_schedule' : 'weeks_schedule';
    } else if (selected === 'MONTH') {
      id = periods === 1 ? 'month_schedule' : periods === 2 ? 'two-months_schedule' : 'months_schedule';
    } else return;
    count.textContent = periods === 2 ? '' : String(periods);
    labels[ids.indexOf(id)].classList.remove('hide');
  };
  payment.addEventListener('input', update);
  payment.addEventListener('keyup', update);
  frequency.addEventListener('change', update);
  update();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initRepaymentLength(), {once: true});
} else initRepaymentLength();
