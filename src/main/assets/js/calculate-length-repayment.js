/* Length of Repayment Calculation

1. Add in the njk file an input field type hidden and class repayment-amount to collect total cliam amount
   <input type="hidden" class="repayment-amount" value="{{ form.totalClaimAmount }}"/>

2. Add following css classes on elements for repayment: instalments, frequency and length

   A. {{ govukInput({
          classes: "repayment-instalments",
          .....
      )}

   B. {{ govukRadios({
          classes: "repayment-frequency",
          ....
      )}

   C. <p class="repayment-length"></p>
*/

(function () {
  const repaymentAmount = document.querySelector('.repayment-amount');
  const repaymentInstalments = document.querySelector('.repayment-instalments');
  const repaymentFrequency = document.querySelector('.repayment-frequency');
  const repaymentLength = document.querySelector('.repayment-length');
  let frequencyVal = null;

  if (repaymentFrequency) {
    repaymentInstalments.addEventListener('keyup', () => {
      getRepaymentSchedule(frequencyVal);
    });

    repaymentFrequency.addEventListener('click', (event) => {
      frequencyVal = event.target.value;
      getRepaymentSchedule(event.target.value);
    });

    const getRepaymentSchedule = (val) => {
      let numberOfInstalments = parseFloat(repaymentInstalments.value) > 0 ? Math.ceil(parseFloat(repaymentAmount.value) / parseFloat(repaymentInstalments.value)) : undefined;

      switch (val) {
        case 'WEEK':
          repaymentLength.innerHTML = numberOfInstalments ? numberOfInstalments + pluralize(numberOfInstalments, 'week') : '-';
          break;
        case 'TWO_WEEKS':
          numberOfInstalments = numberOfInstalments * 2;
          repaymentLength.innerHTML = numberOfInstalments ? numberOfInstalments + pluralize(numberOfInstalments, 'week') : '-';
          break;
        case 'MONTH':
          repaymentLength.innerHTML = numberOfInstalments ? numberOfInstalments + pluralize(numberOfInstalments, 'month') : '-';
          break;
        default:
          return undefined;
      }
    };

    const pluralize = (num, word) => {
      const plural = num < 2 ? '' : 's';
      return ` ${word}${plural}`;
    };

    if (repaymentFrequency) {
      getRepaymentSchedule(repaymentFrequency);
    }
  }
})();
