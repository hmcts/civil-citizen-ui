(function () {
  const repaymentFrequency = document.querySelector('.repayment-frequency');
  const formRepaymentPlan = document.forms['repaymentPlan'];
  const paymentAmount = document.querySelector('#paymentAmount');
  const totalClaimAmount = document.querySelector('#totalClaimAmount');
  const lengthOfRepayment = document.querySelector('#lengthOfRepayment');

  if (repaymentFrequency) {
    const frquency = formRepaymentPlan['repaymentFrequency'].value;

    paymentAmount.addEventListener('keyup', () => {
      getRepaymentSchedule(frquency);
    });

    repaymentFrequency.addEventListener('click', (event) => {
      getRepaymentSchedule(event.target.value);
    });

    const getRepaymentSchedule = (frequency) => {
      let numberOfInstalments = parseFloat(paymentAmount.value) > 0 ? Math.ceil(parseFloat(totalClaimAmount.value) / parseFloat(paymentAmount.value)) : undefined;

      switch (frequency) {
        case 'WEEK':
          lengthOfRepayment.innerHTML = numberOfInstalments ? numberOfInstalments + pluralize(numberOfInstalments, 'week') : '-';
          break;
        case 'TWO_WEEKS':
          numberOfInstalments = numberOfInstalments * 2;
          lengthOfRepayment.innerHTML = numberOfInstalments ? numberOfInstalments + pluralize(numberOfInstalments, 'week') : '-';
          break;
        case 'MONTH':
          lengthOfRepayment.innerHTML = numberOfInstalments ? numberOfInstalments + pluralize(numberOfInstalments, 'month') : '-';
          break;
        default:
          return undefined;
      }
    };

    const pluralize = (num, word) => {
      const plural = num < 2 ? '' : 's';
      return ` ${word}${plural}`;
    };


    if (frquency) {
      getRepaymentSchedule(frquency);
    }
  }
})();
