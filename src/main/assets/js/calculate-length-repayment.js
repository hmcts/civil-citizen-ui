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
  let frequencyVal = null;

  const instalmentsContainer = document.querySelector('#numberOfInstalments');
  const scheduleContainer = document.querySelector('.schedule');
  const weekContainer = document.querySelector('#week_schedule');
  const weeksContainer = document.querySelector('#weeks_schedule');
  const twoWeeksContainer = document.querySelector('#two-weeks_schedule');
  const monthContainer = document.querySelector('#month_schedule');
  const monthsContainer = document.querySelector('#months_schedule');
  const twoMonthsContainer = document.querySelector('#two-months_schedule');
  const CLASS_HIDE = 'hide';

  const hideAll = () => {
    if (scheduleContainer.children.length > 0) {
      for (let i = 0; i < scheduleContainer.children.length; i++) {
        scheduleContainer.children[i].classList.add(CLASS_HIDE);
      }
    }
  };

  hideAll();

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

      const getNumberOfInstalments = () => instalmentsContainer.innerHTML = numberOfInstalments === 1 || numberOfInstalments > 2 ? numberOfInstalments : '';

      const toggleSchedule = (containerOne, containerTwo, containerThree) => {
        numberOfInstalments === 1 ? containerOne.classList.remove(CLASS_HIDE) : containerOne.classList.add(CLASS_HIDE);
        numberOfInstalments === 2 ? containerTwo.classList.remove(CLASS_HIDE) : containerTwo.classList.add(CLASS_HIDE);
        numberOfInstalments > 2 ? containerThree.classList.remove(CLASS_HIDE) : containerThree.classList.add(CLASS_HIDE);
      };

      switch (val) {
        case 'WEEK':
          hideAll();
          getNumberOfInstalments();
          toggleSchedule(weekContainer, twoWeeksContainer, weeksContainer);
          break;
        case 'TWO_WEEKS':
          hideAll();
          numberOfInstalments = numberOfInstalments * 2;
          getNumberOfInstalments();
          toggleSchedule(weekContainer, twoWeeksContainer, weeksContainer);
          break;
        case 'MONTH':
          hideAll();
          getNumberOfInstalments();
          toggleSchedule(monthContainer, twoMonthsContainer, monthsContainer);
          break;
        default:
          return undefined;
      }
    };
  }
})();
