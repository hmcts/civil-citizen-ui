document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementsByClassName('amountRow')) {
    document.querySelector('.amountRow .amount')?.addEventListener('change', getCalculation);
    document.querySelector('.amountRow .schedule')?.addEventListener('change', getCalculation);
  }

  function getCalculation() {
    const data = [];
    const amountRows = Array.from(document.getElementsByClassName('amountRow'));
    amountRows.forEach(element => {
      const amount = element.getElementsByClassName('amount');
      const schedule = element.getElementsByClassName('schedule');
      console.log(amount);
      console.log(schedule);
      if (amount?.length && schedule?.length && amount[0].value && schedule[0].value) {
        data.push({amount: amount[0].value, schedule: schedule[0].value});
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
