/**
 * This is used for calculating a total amount paid  based on the amount and schedule when the amount is paid. The calculation happens on the server side
 * To use this functionality in the template please add the following classes: div class civil-amountRow which will containt the amount and the schedule inputs.
 * For amount input please add civil-amount class, for schedule radiobuttons please add civil-schedule class.
 * To display the total in your page please add total-monthly-income-expense class where you want the total to be displayed
 */
document.addEventListener('DOMContentLoaded', async function () {
  if (document.getElementsByClassName('civil-amountRow')?.length) {
    addCalculationEventListener();
    await getCalculation();
  }
});

function addCalculationEventListener() {
  document.querySelectorAll('.civil-amountRow .civil-amount')?.forEach(element => element.addEventListener('keyup', debounce(getCalculation, 1000)));
  document.querySelectorAll('.civil-amountRow .civil-schedule')?.forEach(element => element.addEventListener('change', getCalculation));
  document.querySelectorAll('.govuk-checkboxes__input').forEach(element => element.addEventListener('change', getCalculation));
}

function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

function getSelectedInput(inputs) {
  let selected;
  for (let i = 0; i < inputs?.length; i++) {
    if (inputs[i].checked) {
      selected = inputs[i];
      break;
    }
  }
  return selected;
}

function inputsHaveValues(amount, selectedSchedule) {
  return amount?.length && selectedSchedule && amount[0].value && selectedSchedule.value;
}

function getCheckbox(element) {
  if (element.parentNode?.classList.contains('govuk-checkboxes__conditional')) {
    return element.parentNode;
  } else {
    return element.parentNode.parentNode;
  }
}

async function getCalculation() {
  const amountToCalculate = [];
  const amountRows = Array.from(document.getElementsByClassName('civil-amountRow'));
  amountRows.forEach(element => {
    const parent = getCheckbox(element);
    const amount = element.getElementsByClassName('civil-amount');
    const schedules = element.querySelectorAll('.civil-schedule input');
    const selectedSchedule = getSelectedInput(schedules);
    if (inputsHaveValues(amount, selectedSchedule) && !parent.classList.contains('govuk-checkboxes__conditional--hidden')) {
      amountToCalculate.push({amount: amount[0].value, schedule: selectedSchedule.value});
    }
  });
  const csrfToken = document.getElementsByName('_csrf')[0].value;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken,
    },
    body: JSON.stringify(amountToCalculate),
  };
  if (amountToCalculate.length > 0) {
    const response = await fetch('/total-income-expense-calculation', options);
    const data = await response.json();
    document.getElementsByClassName('total-monthly-income-expense')[0].innerHTML = data;
  } else {
    document.getElementsByClassName('total-monthly-income-expense')[0].innerHTML = '0';
  }
}

export {
  getCalculation,
  addCalculationEventListener,
  debounce,
};

