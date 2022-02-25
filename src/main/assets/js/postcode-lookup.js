(function () {
  const formAddress = document.forms['address'];
  let isCorrespondenceAddressToBeValidated = formAddress['isCorrespondenceAddressToBeValidated'];
  const enterAddressManuallyLink = document.querySelector('#enterAddressManually');
  const findAddressBtn = document.querySelector('#findAddress');
  const selectAddress = document.querySelector('#selectAddress');
  let correspondenceAddressContainer = document.querySelector('#correspondenceAddress');
  const govukVisuallyHidden = 'govuk-visually-hidden';

  // -- ENTER ADDRESS MANUALLY
  if (enterAddressManuallyLink) {
    // -- Click on enter address manually link to display form
    enterAddressManuallyLink
      .addEventListener('click', function (event) {
        event.preventDefault();
        this.classList.add(govukVisuallyHidden);
        correspondenceAddressContainer.classList.remove(govukVisuallyHidden);
        isCorrespondenceAddressToBeValidated.value = true;
      });
  }


  // -- FIND ADDRESS BUTTON
  if (findAddressBtn) {
    const correspondencePostcode = formAddress['correspondencePostcode'];
    // -- Enter postcode and submit
    findAddressBtn
      .addEventListener('click', (event) => {
        event.preventDefault();
        lookupPostcode(correspondencePostcode.value);
      });

    // -- Select an address and bind it to the correspondence form
    selectAddress.addEventListener('change', (event) => {
      event.preventDefault();
      const addressArray = event.target.value.split(',');
      formAddress['correspondenceAddressLine1'].value = addressArray[0] + ' ' + addressArray[1];
      formAddress['correspondenceCity'].value = addressArray[2];
      formAddress['correspondencePostCode'].value = addressArray[3];
      enterAddressManuallyLink.classList.add(govukVisuallyHidden);
      correspondenceAddressContainer.classList.remove(govukVisuallyHidden);
      isCorrespondenceAddressToBeValidated.value = true;
    });
  }

  // -- Bind list of addresses to selecte drop down
  const addDataToSelectComponent = (postcodeResponse) => {
    const correspondenceAddressList = formAddress['correspondenceAddressList'];
    const nonSelectableoption = document.createElement('option');
    nonSelectableoption.label = postcodeResponse.addresses.length + ' addresses found';
    nonSelectableoption.value = postcodeResponse.addresses.length + ' addresses found';
    nonSelectableoption.disabled = true;
    nonSelectableoption.selected = true;
    correspondenceAddressList.add(nonSelectableoption);
    postcodeResponse.addresses.map((item) => {
      const option = document.createElement('option');
      option.label = item.formattedAddress;
      option.value = item.formattedAddress;
      correspondenceAddressList.add(option);
    });
    selectAddress.classList.remove(govukVisuallyHidden);
  };

  const lookupPostcode = (postcode) => {
    let xhr = new XMLHttpRequest();
    postcode = postcode.trim().replace(/[\u202F\u00A0\u2000\u2001\u2003]/g, ' ');
    xhr.open('GET', '/postcode-lookup?postcode=' + encodeURIComponent(postcode));
    xhr.onload = function () {
      let postcodeResponse = JSON.parse(xhr.responseText);
      addDataToSelectComponent(postcodeResponse);
    };
    xhr.send();
  };

})();

