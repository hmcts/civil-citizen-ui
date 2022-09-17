(function () {
  const sectionTypes = {
    PRIMARY: 'primary',
    CORRESPONDANCE: 'correspondance',
  };
  const formAddress = document.forms["address"];
  const postcodeCtrl = formAddress ? formAddress["postcode"] : null;
  const p_postcodeCtrl = formAddress ? formAddress["p_postcode"] : null;
  const addressSelectMenu = formAddress
    ? formAddress["correspondenceAddressList"]
    : null;

  const p_addressSelectMenu = formAddress
    ? formAddress["primaryAddressList"]
    : null;

  const addressLine1Id = "correspondenceAddressLine1";
  const addressLine2Id = "correspondenceAddressLine2";
  const addressLine3Id = "correspondenceAddressLine3";
  const cityId = "correspondenceCity";
  const postcodeId = "correspondencePostCode";



  const addressManuallyLink = document.querySelector("#enterAddressManually");
  const findAddressButton = document.querySelector("#findAddressButton");
  const selectAddress = document.querySelector("#selectAddress");
  const addressContainer = document.querySelector("#correspondenceAddress");
  const postcodeContainer = document.querySelector("#postcode");
  const postcodeErrorContainer = document.querySelector("#postcode-error");
  const govukVisuallyHidden = "govuk-visually-hidden";
  const govukFormGroupError = "govuk-form-group--error";
  const govukInputError = "govuk-input--error";

  // primary
  const p_addressManuallyLink = document.querySelector('#p_enterAddressManually');
  const p_findAddressButton = document.querySelector("#p_findAddressButton");
  const p_selectAddress = document.querySelector("#p_selectAddress");
  const p_addressContainer = document.querySelector("#primaryAddress");
  const p_postcodeContainer = document.querySelector("#p_postcode");
  const p_postcodeErrorContainer = document.querySelector("#p_postcode-error");
  const p_addressLine1Id = "primaryAddressLine1";
  const p_addressLine2Id = "primaryAddressLine2";
  const p_addressLine3Id = "primaryAddressLine3";
  const p_cityId = "primaryCity";
  const p_postcodeId = "primaryPostCode";


  let _buildingNumber = "";
  let _subBuildingName = "";
  let _buildingName = "";
  let _thoroughfareName = "";
  let _dependentLocality = "";
  let _organisationName = "";

  let postcodeResponse;

  const isNotEmptyAddressCorrespondence = (section) => {
    if (section === sectionTypes.CORRESPONDANCE) {
      return (
        formAddress[addressLine1Id].value ||
        formAddress[addressLine2Id].value ||
        formAddress[cityId].value ||
        formAddress[postcodeId].value
      );
    }
    if (section === sectionTypes.PRIMARY) {
      return (
        formAddress[p_addressLine1Id].value ||
        formAddress[p_addressLine2Id].value ||
        formAddress[p_cityId].value ||
        formAddress[p_postcodeId].value
      );
    }
  };

  // primary
  // const p_isNotEmptyAddressCorrespondence = () => {
  //   return (
  //     formAddress[p_addressLine1Id].value ||
  //     formAddress[p_addressLine2Id].value ||
  //     formAddress[p_cityId].value ||
  //     formAddress[p_postcodeId].value);
  // };

  const isNotEmptyPostcode = (postcode) => {
    if (postcode.value) {
      postcodeError(postcode, false);
      return true;
    } else {
      postcodeError(postcode, true);
      return false;
    }
  };

  const postcodeError = (postcode, hasInputError, section) => {
    let postcodeInput, postcodecontainer, errorContainer;

    // TODO : reafctor

    if (section === sectionTypes.CORRESPONDANCE) {
      postcodeInput = postcode.classList;
      postcodecontainer = postcodeContainer.classList;
      errorContainer = postcodeErrorContainer.classList;
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
    }
    if (section === sectionTypes.PRIMARY) {
      postcodeInput = postcode.classList;
      postcodecontainer = p_postcodeContainer.classList;
      errorContainer = p_postcodeErrorContainer.classList;
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

  const isAddressManuallyEntered = (section) => {
    if (section === sectionTypes.CORRESPONDANCE) {
      addressManuallyLink.classList.add(govukVisuallyHidden);
      addressContainer.classList.remove(govukVisuallyHidden);
    } else if (section === sectionTypes.PRIMARY ) {
      p_addressManuallyLink.classList.add(govukVisuallyHidden);
      p_addressContainer.classList.remove(govukVisuallyHidden);
    }
  };

  // primary
  // const p_isAddressManuallyEntered = () => {
  //   p_addressManuallyLink.classList.add(govukVisuallyHidden);
  //   p_addressContainer.classList.remove(govukVisuallyHidden);
  // };

  const hasAddressProperty = (property) => (property ? property : "");

  // TODO : update it for primary section
  const hasAddressPorperties = (addressSelected) => {
    _buildingNumber = hasAddressProperty(addressSelected.buildingNumber);
    _subBuildingName = hasAddressProperty(addressSelected.subBuildingName);
    _buildingName = hasAddressProperty(addressSelected.buildingName);
    _thoroughfareName = hasAddressProperty(addressSelected.thoroughfareName);
    _dependentLocality = hasAddressProperty(addressSelected.dependentLocality);
    _organisationName = hasAddressProperty(addressSelected.organisationName);
  };

  const resetFormInput = (id) => (formAddress[id].value = "");
  const clearForm = (section) => {
    if (section === sectionTypes.CORRESPONDANCE) {
      resetFormInput(addressLine1Id);
      resetFormInput(addressLine2Id);
      resetFormInput(cityId);
      resetFormInput(postcodeId);
    } else if (section === sectionTypes.PRIMARY) {
      resetFormInput(p_addressLine1Id);
      resetFormInput(p_addressLine2Id);
      resetFormInput(p_cityId);
      resetFormInput(p_postcodeId);
    }
  };

  // const p_clearForm = () => {

  // };

  // -- ENTER ADDRESS MANUALLY
  if (addressManuallyLink) {
    // -- Keep Correspondence Address form visible if values availabel
    if (isNotEmptyAddressCorrespondence(sectionTypes.CORRESPONDANCE)) {
      isAddressManuallyEntered(sectionTypes.CORRESPONDANCE);
    }

    // -- Click on enter address manually link to display form
    addressManuallyLink.addEventListener("click", function (event) {
      event.preventDefault();
      isAddressManuallyEntered(sectionTypes.CORRESPONDANCE);
    });
  }

  // primary
  if (p_addressManuallyLink) {
    // -- Keep Correspondence Address form visible if values availabel
    if (isNotEmptyAddressCorrespondence(sectionTypes.PRIMARY)) {
      isAddressManuallyEntered(sectionTypes.PRIMARY);
    }

    // -- Click on enter address manually link to display form
    p_addressManuallyLink.addEventListener("click", function (event) {
      event.preventDefault();
      isAddressManuallyEntered(sectionTypes.PRIMARY);
    });
  }


  // -- FIND ADDRESS BUTTON
  if (findAddressButton) {
    // -- Enter postcode and submit
    findAddressButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (isNotEmptyPostcode(postcodeCtrl)) {
        lookupPostcode(postcodeCtrl.value, sectionTypes.CORRESPONDANCE);
      }
    });

    // -- Select an address and bind it to the correspondence form
    addressSelectMenu.addEventListener("change", (event) => {
      event.preventDefault();
      let addressSelected = [];
      if (postcodeResponse) {
        // filter address by uprn
        addressSelected = postcodeResponse.addresses.filter(
          (item) => item.uprn === event.target.value
        );
        clearForm(sectionTypes.CORRESPONDANCE);
      }

      hasAddressPorperties(addressSelected[0]);

      if (_organisationName !== "") {
        formAddress[addressLine1Id].value = _organisationName;
        formAddress[addressLine2Id].value =
          _buildingNumber +
          " " +
          _subBuildingName +
          " " +
          _buildingName +
          " " +
          _thoroughfareName;
        formAddress[addressLine3Id].value = _dependentLocality;
      } else if (
        _organisationName === "" &&
        _subBuildingName === "" &&
        _buildingName === ""
      ) {
        formAddress[addressLine1Id].value =
          _buildingNumber + " " + _thoroughfareName;
        formAddress[addressLine2Id].value = _dependentLocality;
      } else {
        formAddress[addressLine1Id].value =
          _organisationName +
          "" +
          _buildingNumber +
          " " +
          _subBuildingName +
          " " +
          _buildingName;
        formAddress[addressLine2Id].value = _thoroughfareName;
        formAddress[addressLine3Id].value = _dependentLocality;
      }

      formAddress[cityId].value = addressSelected[0].postTown;
      formAddress[postcodeId].value = addressSelected[0].postcode;

      if (addressManuallyLink) {
        isAddressManuallyEntered(sectionTypes.CORRESPONDANCE);
      }
    });
  }

  // primary
  if (p_findAddressButton) {
    // -- Enter postcode and submit
    p_findAddressButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (isNotEmptyPostcode(p_postcodeCtrl)) {
        lookupPostcode(p_postcodeCtrl.value, sectionTypes.PRIMARY);
      }
    });

    // -- Select an address and bind it to the correspondence form
    p_addressSelectMenu.addEventListener("change", (event) => {
      event.preventDefault();
      let addressSelected = [];
      if (postcodeResponse) {
        // filter address by uprn
        addressSelected = postcodeResponse.addresses.filter(
          (item) => item.uprn === event.target.value
        );
        clearForm(sectionTypes.PRIMARY);
      }

      hasAddressPorperties(addressSelected[0]);

      // TODO : convert to common func with correspondance

      if (_organisationName !== "") {
        formAddress[p_addressLine1Id].value = _organisationName;
        formAddress[p_addressLine2Id].value =
            _buildingNumber +
            " " +
            _subBuildingName +
            " " +
            _buildingName +
            " " +
            _thoroughfareName;
        formAddress[p_addressLine3Id].value = _dependentLocality;
      } else if (
        _organisationName === "" &&
          _subBuildingName === "" &&
          _buildingName === ""
      ) {
        formAddress[p_addressLine1Id].value =
            _buildingNumber + " " + _thoroughfareName;
        formAddress[p_addressLine2Id].value = _dependentLocality;
      } else {
        formAddress[p_addressLine1Id].value =
            _organisationName +
            "" +
            _buildingNumber +
            " " +
            _subBuildingName +
            " " +
            _buildingName;
        formAddress[p_addressLine2Id].value = _thoroughfareName;
        formAddress[p_addressLine3Id].value = _dependentLocality;
      }

      formAddress[p_cityId].value = addressSelected[0].postTown;
      formAddress[p_postcodeId].value = addressSelected[0].postcode;

      if (p_addressManuallyLink) {
        isAddressManuallyEntered(sectionTypes.PRIMARY);
      }
    });
  }

  // -- Bind list of addresses to selecte drop down
  const bindDataToSelectMenu = (postcodeResponse, section) => {
    if (section === sectionTypes.CORRESPONDANCE) {
      addressSelectMenu.options.length = 0;
      addressSelectMenu.add(
        createOptionMenuItem(
          postcodeResponse.addresses.length + " addresses found",
          "",
          true,
          true
        )
      );
      postcodeResponse.addresses.map((item) => {
        addressSelectMenu.add(
          createOptionMenuItem(item.formattedAddress, item.uprn, false, false)
        );
      });
      selectAddress.classList.remove(govukVisuallyHidden);

    }

    if (section === sectionTypes.PRIMARY) {
      p_addressSelectMenu.options.length = 0;
      p_addressSelectMenu.add(
        createOptionMenuItem(
          postcodeResponse.addresses.length + " addresses found",
          "",
          true,
          true
        )
      );
      postcodeResponse.addresses.map((item) => {
        p_addressSelectMenu.add(
          createOptionMenuItem(item.formattedAddress, item.uprn, false, false)
        );
      });
      p_selectAddress.classList.remove(govukVisuallyHidden);
    }
  };

  // -- API Call
  const lookupPostcode = (postcode, section) => {
    let xhr = new XMLHttpRequest();
    let val = postcode.trim().replace(/[\u202F\u00A0\u2000\u2001\u2003]/g, ' ');
    xhr.open('GET', '/postcode-lookup?postcode=' + encodeURIComponent(val));
    xhr.onload = function () {
      if (xhr.status !== 200) {
        const postcodeEl = sectionTypes.CORRESPONDANCE ? postcodeCtrl : p_postcodeCtrl;
        postcodeError(postcodeEl, true, section);
        return;
      }
      postcodeResponse = JSON.parse(xhr.responseText);
      bindDataToSelectMenu(postcodeResponse, section);
    };
    xhr.send();
  };
})();
