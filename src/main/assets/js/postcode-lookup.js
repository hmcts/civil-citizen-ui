(function () {
  const formAddress = document.forms['address'];
  const isCorrespondenceAddressToBeValidated = formAddress['isCorrespondenceAddressToBeValidated'];
  const correspondenceAddressList = formAddress['correspondenceAddressList'];
  const addressManuallyLink = document.querySelector('#enterAddressManually');
  const findAddressButton = document.querySelector('#findAddressButton');
  const selectAddress = document.querySelector('#selectAddress');
  const correspondenceAddress = document.querySelector('#correspondenceAddress');
  const govukVisuallyHidden = 'govuk-visually-hidden';
  let postcodeResponse;

  const isDefined = (property) => property ? property + ', ' : '';

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
    const correspondencePostcode = formAddress['correspondencePostcode'];
    // -- Enter postcode and submit
    findAddressButton
      .addEventListener('click', (event) => {
        event.preventDefault();
        lookupPostcode(correspondencePostcode.value);
      });

    // -- Select an address and bind it to the correspondence form
    correspondenceAddressList.addEventListener('change', (event) => {
      event.preventDefault();
      const addressSelected = postcodeResponse.addresses.filter((item) => item.uprn === event.target.value);
      console.log(addressSelected);
      formAddress['correspondenceAddressLine1'].value = isDefined(addressSelected[0].buildingNumber) + isDefined(addressSelected[0].subBuildingName) + isDefined(addressSelected[0].buildingName) + isDefined(addressSelected[0].thoroughfareName);
      formAddress['correspondenceCity'].value = addressSelected[0].postTown;
      formAddress['correspondencePostCode'].value = addressSelected[0].postcode;
      addressManuallyLink.classList.add(govukVisuallyHidden);
      correspondenceAddress.classList.remove(govukVisuallyHidden);
      isCorrespondenceAddressToBeValidated.value = true;
    });
  }

  // -- Bind list of addresses to selecte drop down
  const addDataToSelectComponent = (postcodeResponse) => {
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
      let postcodeResponse = JSON.parse(xhr.responseText);
      addDataToSelectComponent(postcodeResponse);
    };
    xhr.send();
  };

})();
