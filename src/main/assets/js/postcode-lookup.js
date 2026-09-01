
import $ from 'jquery';
window.$ = $;

(function () {
  let global;
  let addressSelected = [];
  let organisationName = '';
  let buildingNumber = '';
  let subBuildingName = '';
  let thoroughfareName = '';
  let dependentLocality = '';
  let buildingName = '';
  let postTown = '';
  let postcode = '';
  const POSTCODE_CONTAINER_CALSS = '.postcode-container';
  const postcodeContainer = $(POSTCODE_CONTAINER_CALSS);

  let Ajax = () => {
    const getData = function (val) {
      return $.ajax({
        type: 'GET',
        url: '/postcode-lookup?postcode=' + encodeURIComponent(val),
        data: val,
        datatype: 'json',
      });
    };

    const getList = function (val) {
      return getData(val);
    };

    return {
      getList: getList,
    };
  };

  let FindAddress = {
    settings: {
      this: null,
      findAddressButton: postcodeContainer.find('button'),
      manualAddressLink: postcodeContainer.find('a'),
    },

    init: function () {
      global = this.settings;
      this.bindUIActions();
    },

    bindUIActions: function () {
      global.findAddressButton.on('click', function (event) {
        event.preventDefault();
        global.this = $(this).parents(POSTCODE_CONTAINER_CALSS);
        FindAddress.getAddressList(FindAddress.getPostcode());
      });

      global.manualAddressLink.on('click', function (event) {
        event.preventDefault();
        global.this = $(this).parents(POSTCODE_CONTAINER_CALSS);
        formContainer.toggleForm(true);
      });

    },

    getPostcode: () => $(global.this).parent().find('.postcode-val').val(),

    getAddressList: function (postcodeVal) {

      ajax.getList(postcodeVal)
        .fail(function () {
          FindAddress.showPostcodeError(true);
          formContainer.getFormContainer().find('input').val('');
        })
        .done(function (data) {
          formContainer.toggleForm(false);
          FindAddress.showPostcodeError(false);
          selectMenu.bindDataToSelectMenu(data.addresses);
        });
    },

    showPostcodeError: (flag) => {
      const postcodeErrorContainer = $(global.this).parent().find('.govuk-error-message');
      flag === true ? postcodeErrorContainer.removeClass('govuk-!-display-none') : postcodeErrorContainer.addClass('govuk-!-display-none');
    },
  };

  let SelectMenu = () => {
    const bindDataToSelectMenu = (data) => {
      $(global.this).parent().find('select option').not(':first').remove();

      addAddressesFoundValue(data);

      data.map((item) => {
        $('<option/>', {
          'value': item.udprn,
          'text': item.formattedAddress,
          'disabled': false,
          'selected': false,
        }).appendTo($(global.this).parent().find('select'));
      });

      const addressList = data;

      $(global.this).parent().find('select').closest('.govuk-visually-hidden').removeClass('govuk-visually-hidden');
      $(global.this).parent().find('select').on('change', function () {
        global.this = $(this).parents(POSTCODE_CONTAINER_CALSS);
        findSelectedAddress(addressList, $(this).find(':selected').val());
      });

    };

    const addAddressesFoundValue = (data) => {
      const regex = /\d+/g;
      $(global.this).parent().find('select option:first').text(function (index, text) {
        if (regex.test(text)) {
          return text.replace(regex, data.length);
        }
        $(this).prepend(data.length + ' ');
      });
    };

    const findSelectedAddress = (addressList, val) => {
      addressSelected = addressList.filter((item) => item.udprn === val);
      addressForm.fillForm();
    };

    return {
      bindDataToSelectMenu: bindDataToSelectMenu,
      findSelectedAddress: findSelectedAddress,
    };
  };

  let AddressForm = () => {
    const hasAddressProperty = (property) => (property ? property : '');

    const fillForm = () => {
      organisationName = hasAddressProperty(addressSelected[0]?.organisationName);
      buildingNumber = hasAddressProperty(addressSelected[0]?.buildingNumber);
      subBuildingName = hasAddressProperty(addressSelected[0]?.subBuildingName);
      thoroughfareName = hasAddressProperty(addressSelected[0]?.thoroughfareName);
      dependentLocality = hasAddressProperty(addressSelected[0]?.dependentLocality);
      buildingName = hasAddressProperty(addressSelected[0]?.buildingName);
      postTown = hasAddressProperty(addressSelected[0]?.postTown);
      postcode = hasAddressProperty(addressSelected[0]?.postcode);

      formContainer.toggleForm(true);
      formContainer.getFormContainer().find('input').val('');
      breakAddressIntoDifferentFormFields(formContainer);
    };

    const breakAddressIntoDifferentFormFields = (formContainer) => {
      const parts = [
        organisationName,
        buildingNumber,
        subBuildingName,
        buildingName,
        thoroughfareName,
        dependentLocality,
      ].map(part => part ? String(part).trim() : '');

      const ORGANISATION = 0;
      const BUILDING_NUMBER = 1;
      const SUB_BUILDING_NAME = 2;
      const BUILDING_NAME = 3;
      const THOROUGHFARE_NAME = 4;
      const DEPENDENT_LOCALITY = 5;

      let line1 = '';
      let line2 = '';
      let line3 = '';

      if (parts[ORGANISATION]) {
        line1 = parts[ORGANISATION];
        line2 = [parts[BUILDING_NUMBER], parts[SUB_BUILDING_NAME], parts[BUILDING_NAME], parts[THOROUGHFARE_NAME]].filter(Boolean).join(' ');
        line3 = parts[DEPENDENT_LOCALITY];
      } else if (parts[BUILDING_NUMBER] && !parts[SUB_BUILDING_NAME] && !parts[BUILDING_NAME]) {
        line1 = [parts[BUILDING_NUMBER], parts[THOROUGHFARE_NAME]].filter(Boolean).join(' ');
        line2 = parts[DEPENDENT_LOCALITY];
      } else {
        line1 = [parts[SUB_BUILDING_NAME], parts[BUILDING_NAME]].filter(Boolean).join(' ');
        if (line1) {
          line2 = [parts[BUILDING_NUMBER], parts[THOROUGHFARE_NAME]].filter(Boolean).join(' ');
          line3 = parts[DEPENDENT_LOCALITY];
        } else {
          line1 = parts[THOROUGHFARE_NAME];
          line2 = parts[DEPENDENT_LOCALITY];
        }
      }

      formContainer.getFormInput(0).val(line1);
      formContainer.getFormInput(1).val(line2);
      formContainer.getFormInput(2).val(line3);
      formContainer.getFormInput(3).val(postTown);
      formContainer.getFormInput(4).val(postcode);
    };

    return {
      fillForm: fillForm,
    };
  };

  const AddressFormContainer = () => {

    const toggleForm = (flag) => {
      let container = getFormContainer();
      let addressManuallyHref = getAnchorElement();
      flag ? container.removeClass('govuk-!-display-none') : container.addClass('govuk-!-display-none');
      flag ? addressManuallyHref.addClass('govuk-!-display-none') : addressManuallyHref.removeClass('govuk-!-display-none');
      flag ? container.attr('aria-hidden', 'false') : container.attr('aria-hidden', 'true');
      flag ? addressManuallyHref.attr('aria-hidden', 'true') : addressManuallyHref.attr('aria-hidden', 'false');
    };

    const getFormContainer = () => $(global.this).parent().find('.address-form');
    const getFormInput = (index) => $(global.this).parent().find(`.address-form input:eq(${index})`);
    const getAnchorElement = () => $(global.this).parent().find('a');

    return {
      toggleForm: toggleForm,
      getFormContainer: getFormContainer,
      getFormInput: getFormInput,
      getAnchorElement: getAnchorElement,
    };
  };

  // -- Initialize -------------
  const ajax = Ajax();
  const selectMenu = SelectMenu();
  const formContainer = AddressFormContainer();
  const addressForm = AddressForm();
  FindAddress.init();

})();
