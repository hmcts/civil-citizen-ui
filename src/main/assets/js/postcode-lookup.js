
(function () {
  const addressTypes = {
    PRIMARY: 'primary',
    CORRESPONDENCE: 'correspondence',
  };
  const formAddress = document.forms['address'];
  const postcodeCtrl = formAddress ? formAddress['postcode'] : null;
  const primaryPostcodeCtrl = formAddress
    ? formAddress['primaryPostcode']
    : null;
  const correspondenSelectMenu = formAddress
    ? formAddress['correspondenceAddressList']
    : null;
  const primaryAddressSelectMenu = formAddress
    ? formAddress['primaryAddressList']
    : null;
  const addressManuallyLink = document.querySelector('#enterAddressManually');
  const correspondenSelectAddress = document.querySelector('#selectAddress');
  const addressContainer = document.querySelector('#correspondenceAddress');
  const postcodeContainer = document.querySelector('#postcodeContainer');
  const postcodeErrorContainer = document.querySelector('#postcode-error');
  const govukVisuallyHidden = 'govuk-visually-hidden';
  const govukFormGroupError = 'govuk-form-group--error';
  const govukInputError = 'govuk-input--error';
  const primaryAddressManuallyLink = document.querySelector('#primaryEnterAddressManually');
  const primarySelectAddress = document.querySelector('#primarySelectAddress');
  const primaryAddressContainer = document.querySelector('#primaryAddress');
  const primaryPostcodeContainer = document.querySelector('#primaryPostcodeContainer');
  const primaryPostcodeErrorContainer = document.querySelector('#primaryPostcode-error');
  const addressManuallyLinks = document.querySelectorAll('.enterAddressManually');
  const findAddressButtons = document.querySelectorAll('.findAddressButton');
  const addressSelectMenus = document.querySelectorAll('.addressList');
  const addressLine1Id = 'AddressLine1';
  const addressLine2Id = 'AddressLine2';
  const addressLine3Id = 'AddressLine3';
  const cityId = 'City';
  const postcodeId = 'PostCode';

  let postcodeResponse;

  const isNotEmptyAddress = (address) => {
    return (
      formAddress[address + addressLine1Id]?.value ||
      formAddress[address + addressLine2Id]?.value ||
      formAddress[address + cityId]?.value ||
      formAddress[address + postcodeId]?.value
    );
  };

  const isNotEmptyPostcode = (postcode, address) => {
    if (postcode.value) {
      postcodeError(postcode, false, address);
      return true;
    } else {
      postcodeError(postcode, true, address);
      return false;
    }
  };

  const postcodeError = (postcode, hasInputError, address) => {
    const postcodeInput = postcode.classList;
    let postcodecontainer, errorContainer, selectAddressEl;
    if (address === addressTypes.PRIMARY) {
      postcodecontainer = primaryPostcodeContainer.classList;
      errorContainer = primaryPostcodeErrorContainer.classList;
      selectAddressEl = primarySelectAddress.classList;
    }
    if (address === addressTypes.CORRESPONDENCE) {
      postcodecontainer = postcodeContainer.classList;
      errorContainer = postcodeErrorContainer.classList;
      selectAddressEl = correspondenSelectAddress.classList;
    }
    if (address && hasInputError) {
      postcodeInput.add(govukInputError);
      postcodecontainer.add(govukFormGroupError);
      errorContainer.remove(govukVisuallyHidden);
      selectAddressEl.add(govukVisuallyHidden);
    } else if (address) {
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

  const isAddressManuallyEntered = (address) => {
    if (address === addressTypes.CORRESPONDENCE) {
      addressManuallyLink.classList.add(govukVisuallyHidden);
      addressContainer.classList.remove(govukVisuallyHidden);
    } else if (address === addressTypes.PRIMARY) {
      primaryAddressManuallyLink.classList.add(govukVisuallyHidden);
      primaryAddressContainer.classList.remove(govukVisuallyHidden);
    }
  };

  const hasAddressProperty = (property) => (property ? property : '');

  const resetFormInput = (id) => {
    if (formAddress[id]) {
      formAddress[id].value = '';
    }
  };

  const clearForm = (address) => {
    resetFormInput(address + addressLine1Id);
    resetFormInput(address + addressLine2Id);
    resetFormInput(address + cityId);
    resetFormInput(address + postcodeId);
  };

  // -- ENTER ADDRESS MANUALLY
  addressManuallyLinks?.length &&
    addressManuallyLinks.forEach((addressManuallyLink) => {
      let address = addressTypes.PRIMARY;
      if (addressManuallyLink.id === 'enterAddressManually') {
        address = addressTypes.CORRESPONDENCE;
      }
      // -- Keep Address form visible if values availabe
      if (isNotEmptyAddress(address)) {
        isAddressManuallyEntered(address);
      }

      // -- Click on enter address manually link to display form
      addressManuallyLink.addEventListener('click', function (event) {
        event.preventDefault();
        isAddressManuallyEntered(address);
      });
    });

  // -- FIND ADDRESS BUTTON
  findAddressButtons?.length &&
    findAddressButtons.forEach((findAddressButton) => {
      let address = addressTypes.PRIMARY;
      let _postcodeCtrl = primaryPostcodeCtrl;
      if (findAddressButton.id === 'findAddressButton') {
        address = addressTypes.CORRESPONDENCE;
        _postcodeCtrl = postcodeCtrl;
      }
      // -- Enter postcode and submit
      findAddressButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (isNotEmptyPostcode(_postcodeCtrl, address)) {
          lookupPostcode(_postcodeCtrl.value, address);
        }
      });
    });

  // -- Select an address and bind it to the correspondence form
  addressSelectMenus?.length &&
    addressSelectMenus.forEach((addressSelectMenu) => {
      let address = addressTypes.PRIMARY;
      if (addressSelectMenu.id === 'correspondenceAddressList') {
        address = addressTypes.CORRESPONDENCE;
      }
      addressSelectMenu.addEventListener('change', (event) => {
        event.preventDefault();
        let addressSelected = [];
        if (postcodeResponse) {
          // filter address by uprn
          addressSelected = postcodeResponse.addresses.filter(
            (item) => item.uprn === event.target.value,
          );
          clearForm(address);
        }

        const organisationName = hasAddressProperty(addressSelected[0]?.organisationName);
        const buildingNumber = hasAddressProperty(addressSelected[0]?.buildingNumber);
        const subBuildingName = hasAddressProperty(addressSelected[0]?.subBuildingName);
        const thoroughfareName = hasAddressProperty(addressSelected[0]?.thoroughfareName);
        const dependentLocality = hasAddressProperty(addressSelected[0]?.dependentLocality);
        const buildingName = hasAddressProperty(addressSelected[0]?.buildingName);

        if (organisationName !== '') {
          formAddress[address + addressLine1Id].value = organisationName;
          formAddress[address + addressLine2Id].value =
            buildingNumber +
            ' ' +
            subBuildingName +
            ' ' +
            buildingName +
            ' ' +
            thoroughfareName;
          formAddress[address + addressLine3Id].value = dependentLocality;
        } else if (
          organisationName === '' &&
          subBuildingName === '' &&
          buildingName === ''
        ) {
          formAddress[address + addressLine1Id].value =
            buildingNumber + ' ' + thoroughfareName;
          formAddress[address + addressLine2Id].value = dependentLocality;
        } else {
          formAddress[address + addressLine1Id].value =
            organisationName +
            '' +
            buildingNumber +
            ' ' +
            subBuildingName +
            ' ' +
            buildingName;
          formAddress[address + addressLine2Id].value = thoroughfareName;
          formAddress[address + addressLine3Id].value = dependentLocality;
        }

        formAddress[address + cityId].value = addressSelected[0].postTown;
        formAddress[address + postcodeId].value = addressSelected[0].postcode;

        if (addressManuallyLinks?.length) {
          isAddressManuallyEntered(address);
        }
      });
    });

  // -- Bind list of addresses to selecte drop down
  const bindDataToSelectMenu = (postcodeResponse, address) => {
    let addressSelectMenu = primaryAddressSelectMenu;
    let selectAddress = primarySelectAddress;
    if (address === addressTypes.CORRESPONDENCE) {
      addressSelectMenu = correspondenSelectMenu;
      selectAddress = correspondenSelectAddress;
    }
    addressSelectMenu.options.length = 0;
    addressSelectMenu.add(
      createOptionMenuItem(
        postcodeResponse.addresses.length + ' addresses found',
        '',
        true,
        true,
      ),
    );
    postcodeResponse.addresses.map((item) => {
      addressSelectMenu.add(
        createOptionMenuItem(item.formattedAddress, item.uprn, false, false),
      );
    });
    selectAddress.classList.remove(govukVisuallyHidden);
  };

  // -- API Call
  const lookupPostcode = (postcode, address) => {
    let xhr = new XMLHttpRequest();
    let val = postcode.trim().replace(/[\u202F\u00A0\u2000\u2001\u2003]/g, ' ');
    xhr.open('GET', '/postcode-lookup?postcode=' + encodeURIComponent(val));
    xhr.onload = function () {
      if (xhr.status !== 200) {
        const postcodeEl = address === addressTypes.CORRESPONDENCE
          ? postcodeCtrl
          : primaryPostcodeCtrl;
        postcodeError(postcodeEl, true, address);
        return;
      }
      postcodeResponse = JSON.parse(xhr.responseText);
      bindDataToSelectMenu(postcodeResponse, address);
    };
    xhr.send();
  };
})();
