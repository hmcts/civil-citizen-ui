(function () {
  const formAddress = document.forms['address'];
  const postcodeCtrl = formAddress['postcode'];
  const addressSelectMenu = formAddress['correspondenceAddressList'];
  const addressLine1Id = 'correspondenceAddressLine1';
  const addressLine2Id = 'correspondenceAddressLine2';
  const cityId = 'correspondenceCity';
  const postcodeId = 'correspondencePostCode';

  const addressManuallyLink = document.querySelector('#enterAddressManually');
  const findAddressButton = document.querySelector('#findAddressButton');
  const selectAddress = document.querySelector('#selectAddress');
  const addressContainer = document.querySelector('#correspondenceAddress');
  const postcodeContainer = document.querySelector('#postcode');
  const postcodeErrorContainer = document.querySelector('#postcode-error');
  const govukVisuallyHidden = 'govuk-visually-hidden';
  const govukFormGroupError = 'govuk-form-group--error';
  const govukInputError = 'govuk-input--error';

  let _buildingNumber = '';
  let _subBuildingName = '';
  let _buildingName = '';
  let _thoroughfareName = '';

  let postcodeResponse;


  const isNotEmptyPostcode = (postcode) => {
    if (postcode.value) {
      postcodeError(postcode, false);
      return true;
    } else {
      postcodeError(postcode, true);
      return false;
    }
  };

  const postcodeError = (postcode, hasInputError) => {
    const postcodeInput = postcode.classList;
    const postcodecontainer = postcodeContainer.classList;
    const errorContainer = postcodeErrorContainer.classList;
    if (hasInputError) {
      postcodeInput.add(govukInputError);
      postcodecontainer.add(govukFormGroupError);
      errorContainer.remove(govukVisuallyHidden);
      selectAddress.classList.add(govukVisuallyHidden);
    } else {
      postcodeInput.remove(govukInputError);
      postcodecontainer.remove(govukFormGroupError);
      errorContainer.add(govukVisuallyHidden);
    }
  };

  const createOptionMenuItem = (label, value, isDisabled, isSelected) => {
    const option = document.createElement('option');
    option.label = label;
    option.value = value;
    option.disabled = isDisabled;
    option.selected = isSelected;
    return option;
  };

  const isAddressManuallyEntered = () => {
    addressManuallyLink.classList.add(govukVisuallyHidden);
    addressContainer.classList.remove(govukVisuallyHidden);
  };

  const hasAddressProperty = (property) => property ? property : '';
  const hasAddressPorperties = (addressSelected) => {
    _buildingNumber = hasAddressProperty(addressSelected.buildingNumber);
    _subBuildingName = hasAddressProperty(addressSelected.subBuildingName);
    _buildingName = hasAddressProperty(addressSelected.buildingName);
    _thoroughfareName = hasAddressProperty(addressSelected.thoroughfareName);
  };

  const resetFormInput = (id) => formAddress[id].value = '';
  const clearForm = () => {
    resetFormInput(addressLine1Id);
    resetFormInput(addressLine2Id);
    resetFormInput(cityId);
    resetFormInput(postcodeId);
  };


  // -- ENTER ADDRESS MANUALLY
  if (addressManuallyLink) {
    // -- Click on enter address manually link to display form
    addressManuallyLink
      .addEventListener('click', function (event) {
        event.preventDefault();
        isAddressManuallyEntered();
      });
  }


  // -- FIND ADDRESS BUTTON
  if (findAddressButton) {
    // -- Enter postcode and submit
    findAddressButton
      .addEventListener('click', (event) => {
        event.preventDefault();
        if (isNotEmptyPostcode(postcodeCtrl)) {
          lookupPostcode(postcodeCtrl.value);
        }
      });

    // -- Select an address and bind it to the correspondence form
    addressSelectMenu.addEventListener('change', (event) => {
      event.preventDefault();
      let addressSelected = [];
      if (postcodeResponse) { // filter address by uprn
        addressSelected = postcodeResponse.addresses.filter((item) => item.uprn === event.target.value);
        clearForm();
      }
      console.log(addressSelected);

      hasAddressPorperties(addressSelected[0]);

      if (_subBuildingName !== '' || _buildingName !== '') {
        // split in 2 lines
        formAddress[addressLine1Id].value = _buildingNumber + ' ' + _subBuildingName + ' ' + _buildingName;
        formAddress[addressLine2Id].value = _thoroughfareName;
      } else {
        formAddress[addressLine1Id].value = _buildingNumber + ' ' + _thoroughfareName + ' ';
      }

      formAddress[cityId].value = addressSelected[0].postTown;
      formAddress[postcodeId].value = addressSelected[0].postcode;

      if (addressManuallyLink) {
        isAddressManuallyEntered();
      }
    });
  }

  // -- Bind list of addresses to selecte drop down
  const bindDataToSelectMenu = (postcodeResponse) => {
    addressSelectMenu.options.length = 0;
    addressSelectMenu.add(createOptionMenuItem(postcodeResponse.addresses.length + ' addresses found', '', true, true));
    postcodeResponse.addresses.map((item) => {
      addressSelectMenu.add(createOptionMenuItem(item.formattedAddress, item.uprn, false, false));
    });
    selectAddress.classList.remove(govukVisuallyHidden);
  };

  // -- API Call
  const lookupPostcode = (postcode) => {
    let xhr = new XMLHttpRequest();
    let val = postcode.trim().replace(/[\u202F\u00A0\u2000\u2001\u2003]/g, ' ');
    xhr.open('GET', '/postcode-lookup?postcode=' + encodeURIComponent(val));
    xhr.onload = function () {
      if (xhr.status !== 200) {
        postcodeError(postcodeCtrl, true);
        return;
      }
      postcodeResponse = JSON.parse(xhr.responseText);
      bindDataToSelectMenu(postcodeResponse);
    };
    xhr.send();
  };

})();
