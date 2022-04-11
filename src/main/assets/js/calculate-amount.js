document.addEventListener('DOMContentLoaded', async function () {
  if (document.getElementsByClassName('amountRow')) {
    document.querySelectorAll('.amountRow .amount')?.forEach(element => element.addEventListener('change', getCalculation));
    document.querySelectorAll('.amountRow .schedule')?.forEach(element => element.addEventListener('change', getCalculation));
    await getCalculation();
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

  async function getCalculation() {
    const data = [];
    const amountRows = Array.from(document.getElementsByClassName('amountRow'));
    amountRows.forEach(element => {
      const amount = element.getElementsByClassName('amount');
      const schedules = element.querySelectorAll('.schedule input');
      const selectedSchedule = getSelectedInput(schedules);
      if (inputsHaveValues(amount, selectedSchedule)) {
        data.push({amount: amount[0].value, schedule: selectedSchedule.value});
      }
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    if (data.length > 0) {
      const response = await fetch('/total-income-expense-calculation', options);
      const data = await response.json();
      document.getElementsByClassName('total-monthly-income-expense')[0].innerHTML = data;
    }
  }
});
