(function () {
  const formAddress = document.forms['address'];
  const isCorrespondenceAddressToBeValidated = formAddress['isCorrespondenceAddressToBeValidated'];
  const correspondenceAddressList = formAddress['correspondenceAddressList'];
  const correspondenceAddressLine1 = 'correspondenceAddressLine1';
  const correspondenceCity = 'correspondenceCity';
  const correspondencePostCodeId = 'correspondencePostCode';

  const addressManuallyLink = document.querySelector('#enterAddressManually');
  const findAddressButton = document.querySelector('#findAddressButton');
  const selectAddress = document.querySelector('#selectAddress');
  const correspondenceAddress = document.querySelector('#correspondenceAddress');
  const postcodeContainer = document.querySelector('#postcodeContainer');
  const govukVisuallyHidden = 'govuk-visually-hidden';
  const govukFormGroupError = 'govuk-form-group--error';
  const govukInputError = 'govuk-input--error';

  let postcodeResponse;

  const hasAddressProperty = (property) => property ? property : '';
  const resetFormInput = (id) => formAddress[id].value = '';
  const isValidPostcode = (postcode) => {
    if (postcode.value) {
      postcode.classList.remove(govukInputError);
      postcodeContainer.classList.remove(govukFormGroupError);
      return true;
    } else {
      postcode.classList.add(govukInputError);
      postcodeContainer.classList.add(govukFormGroupError);
      return false;
    }
  };

  // -- ENTER ADDRESS MANUALLY
  if (addressManuallyLink) {
    // -- Click on enter address manually link to display form
    addressManuallyLink
      .addEventListener('click', function (event) {
        event.preventDefault();
        this.classList.add(govukVisuallyHidden);
        correspondenceAddress.classList.remove(govukVisuallyHidden);
        isCorrespondenceAddressToBeValidated.value = true;
      });
  }


  // -- FIND ADDRESS BUTTON
  if (findAddressButton) {
    const postcode = formAddress['postcode'];
    // -- Enter postcode and submit
    findAddressButton
      .addEventListener('click', (event) => {
        event.preventDefault();
        if (isValidPostcode(postcode)) {
          lookupPostcode(postcode.value);
        }
      });

    // -- Select an address and bind it to the correspondence form
    correspondenceAddressList.addEventListener('change', (event) => {
      event.preventDefault();
      let addressSelected = [];
      if (postcodeResponse) {
        addressSelected = postcodeResponse.addresses.filter((item) => item.uprn === event.target.value);
        resetFormInput(correspondenceAddressLine1);
        resetFormInput(correspondenceCity);
        resetFormInput(correspondencePostCodeId);
      }
      console.log(addressSelected);

      formAddress[correspondenceAddressLine1].value = hasAddressProperty(addressSelected[0].buildingNumber) + ' ' + hasAddressProperty(addressSelected[0].subBuildingName) + ' ' + hasAddressProperty(addressSelected[0].buildingName) + ' ' + hasAddressProperty(addressSelected[0].thoroughfareName);
      formAddress[correspondenceCity].value = addressSelected[0].postTown;
      formAddress[correspondencePostCodeId].value = addressSelected[0].postcode;

      addressManuallyLink.classList.add(govukVisuallyHidden);
      correspondenceAddress.classList.remove(govukVisuallyHidden);
      isCorrespondenceAddressToBeValidated.value = true;
    });
  }

  // -- Bind list of addresses to selecte drop down
  const addDataToSelectComponent = (postcodeResponse) => {
    correspondenceAddressList.options.length = 0;
    const nonSelectableoption = document.createElement('option');
    nonSelectableoption.label = postcodeResponse.addresses.length + ' addresses found';
    nonSelectableoption.value = postcodeResponse.addresses.length + ' addresses found';
    nonSelectableoption.disabled = true;
    nonSelectableoption.selected = true;
    correspondenceAddressList.add(nonSelectableoption);
    postcodeResponse.addresses.map((item) => {
      const option = document.createElement('option');
      option.label = item.formattedAddress;
      option.value = item.uprn;
      correspondenceAddressList.add(option);
    });
    selectAddress.classList.remove(govukVisuallyHidden);
  };

  const lookupPostcode = (postcode) => {
    let xhr = new XMLHttpRequest();
    postcode = postcode.trim().replace(/[\u202F\u00A0\u2000\u2001\u2003]/g, ' ');
    xhr.open('GET', '/postcode-lookup?postcode=' + encodeURIComponent(postcode));
    xhr.onload = function () {
      postcodeResponse = JSON.parse(xhr.responseText);
      addDataToSelectComponent(postcodeResponse);
    };
    xhr.send();
  };

})();
