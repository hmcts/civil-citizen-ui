(function () {
  const enterAddressManuallyElment = document.querySelector('#enterAddressManually');
  if (enterAddressManuallyElment) {

    const govukVisuallyHidden = 'govuk-visually-hidden';
    let isCorrespondenceAddressToBeValidated = document.forms['address']['isCorrespondenceAddressToBeValidated'];
    let correspondenceAddressDIV = document.querySelector('#correspondenceAddress');

    // -- Click on enter address manually link to display form
    enterAddressManuallyElment
      .addEventListener('click', function (event) {
        event.preventDefault();
        this.classList.add(govukVisuallyHidden);
        correspondenceAddressDIV.classList.remove(govukVisuallyHidden);
        isCorrespondenceAddressToBeValidated.value = true;
      });
  }
})();
