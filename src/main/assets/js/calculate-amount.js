document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementsByClassName('amountRow')) {
    document.querySelector('.amountRow .amount')?.addEventListener('change', getCalculation);
    document.querySelector('.amountRow .schedule')?.addEventListener('change', getCalculation);
  }

  function getSelectedInput(inputs) {
    let selected;
    if (inputs?.length) {
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
          selected = inputs[i];
          break;
        }
      }
    }
    return selected;
  }

  function getCalculation() {
    const data = [];
    const amountRows = Array.from(document.getElementsByClassName('amountRow'));
    amountRows.forEach(element => {
      const amount = element.getElementsByClassName('amount');
      const schedules = element.querySelectorAll('.schedule input');
      const selectedSchedule = getSelectedInput(schedules);
      if (amount?.length && selectedSchedule && amount[0].value && selectedSchedule.value) {
        data.push({amount: amount[0].value, schedule: selectedSchedule.value});
      }
      console.log(data);
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    if (data.length > 0) {
      fetch('/total-income-expense-calculation', options).then((response) => console.log(response));
    }
  }
});
