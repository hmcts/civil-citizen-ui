const {debounce} = require('./calculate-amount');
document.addEventListener('DOMContentLoaded', async function () {
  if (document.getElementsByClassName('civil-amount-breakdown-row')?.length) {
    addTotalClaimAmountCalculationEventListener();
    populateTotalClaimAmount();
  }
});

function calculateTotal() {
  const amountInputArray = Array.from(document.getElementsByClassName('civil-claim-amount'));
  if (amountInputArray.length) {
    const amountArray = amountInputArray.map(element => Number(element.value));
    const total = amountArray.length ? amountArray.reduce((a, b) => a + b) : 0;
    return total.toFixed(2);
  }
}

function populateTotalClaimAmount() {
  const total = calculateTotal();
  const totalPlaceholder = Array.from(document.getElementsByClassName('total-claim-amount'));
  totalPlaceholder.forEach(element => {
    if (element.type === 'hidden') {
      element.value = total;
    }else{
      element.innerHTML = total;
    }
  });
}

function addTotalClaimAmountCalculationEventListener() {
  document.querySelectorAll('.civil-amount-breakdown-row')?.forEach(element => element.addEventListener('keyup', debounce(populateTotalClaimAmount, 1000)));
}

export {
  addTotalClaimAmountCalculationEventListener,
};
