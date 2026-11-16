
import $ from 'jquery';
window.$ = $;

(function () {
  const SPACE = ' ';
  const EMPTY_STRING = '';
  const POSTCODE_CONTAINER_CLASS = '.postcode-container';

  let appSettings;
  let addressSelected = [];
  const postcodeContainer = $(POSTCODE_CONTAINER_CLASS);

  const Ajax = () => {
    const getData = (val) => $.ajax({
      type: 'GET',
      url: '/postcode-lookup?postcode=' + encodeURIComponent(val),
      dataType: 'json',
    });

    return {
      getList: (val) => getData(val),
    };
  };

  const FindAddress = {
    settings: {
      container: null,
      findAddressButton: postcodeContainer.find('button'),
      manualAddressLink: postcodeContainer.find('a'),
    },

    init: function () {
      appSettings = this.settings;
      this.bindUIActions();
    },

    bindUIActions: function () {
      appSettings.findAddressButton.on('click', function (event) {
        event.preventDefault();
        appSettings.container = $(this).parents(POSTCODE_CONTAINER_CLASS);
        FindAddress.getAddressList(FindAddress.getPostcode());
      });

      appSettings.manualAddressLink.on('click', function (event) {
        event.preventDefault();
        appSettings.container = $(this).parents(POSTCODE_CONTAINER_CLASS);
        formContainer.toggleForm(true);
      });

    },

    getPostcode: () => appSettings.container.find('.postcode-val').val(),

    getAddressList: function (postcodeVal) {

      ajax.getList(postcodeVal)
        .fail(function () {
          FindAddress.showPostcodeError(true);
          formContainer.getFormContainer().find('input').val(EMPTY_STRING);
        })
        .done(function (data) {
          formContainer.toggleForm(false);
          FindAddress.showPostcodeError(false);
          selectMenu.bindDataToSelectMenu(data.addresses);
        });
    },

    showPostcodeError: (flag) => {
      const postcodeErrorContainer = appSettings.container.find('.govuk-error-message');
      flag ? postcodeErrorContainer.removeClass('govuk-!-display-none') : postcodeErrorContainer.addClass('govuk-!-display-none');
    },
  };

  const SelectMenu = () => {
    const bindDataToSelectMenu = (data) => {
      const $select = appSettings.container.find('select');
      $select.find('option').not(':first').remove();

      addAddressesFoundValue(data);

      data.forEach((item) => {
        $('<option/>', {
          value: item.udprn,
          text: item.formattedAddress,
          disabled: false,
          selected: false,
        }).appendTo($select);
      });

      $select.closest('.govuk-visually-hidden').removeClass('govuk-visually-hidden');
      $select.off('change').on('change', function () {
        appSettings.container = $(this).parents(POSTCODE_CONTAINER_CLASS);
        findSelectedAddress(data, $(this).find(':selected').val());
      });

    };

    const addAddressesFoundValue = (data) => {
      const regex = /\d+/g;
      appSettings.container.find('select option:first').text((_, text) => {
        if (regex.test(text)) {
          return text.replace(regex, data.length);
        }
        return `${data.length}${SPACE}${text}`;
      });
    };

    const findSelectedAddress = (addressList, val) => {
      addressSelected = addressList.filter((item) => item.udprn === val);
      addressForm.fillForm();
    };

    return {
      bindDataToSelectMenu,
      findSelectedAddress,
    };
  };

  const AddressForm = () => {
    const getVal = (val) => (val || EMPTY_STRING).toString().trim();

    const fillForm = () => {
      const address = addressSelected[0] || {};

      formContainer.toggleForm(true);
      formContainer.getFormContainer().find('input').val(EMPTY_STRING);
      breakAddressIntoDifferentFormFields(formContainer, address);
    };

    const breakAddressIntoDifferentFormFields = (formContainer, address) => {
      const org = getVal(address.organisationName);
      const bNum = getVal(address.buildingNumber);
      const subBName = getVal(address.subBuildingName);
      const bName = getVal(address.buildingName);
      const thoroughfare = getVal(address.thoroughfareName);
      const locality = getVal(address.dependentLocality);
      const postTown = getVal(address.postTown);
      const postcode = getVal(address.postcode);

      let line1;
      let line2;
      let line3 = EMPTY_STRING;

      if (org) {
        line1 = org;
        line2 = [bNum, subBName, bName, thoroughfare].filter(Boolean).join(SPACE);
        line3 = locality;
      } else if (bNum && !subBName && !bName) {
        line1 = [bNum, thoroughfare].filter(Boolean).join(SPACE);
        line2 = locality;
      } else {
        line1 = [subBName, bName].filter(Boolean).join(SPACE);
        if (line1) {
          line2 = [bNum, thoroughfare].filter(Boolean).join(SPACE);
          line3 = locality;
        } else {
          line1 = thoroughfare;
          line2 = locality;
        }
      }

      formContainer.getFormInput(0).val(line1);
      formContainer.getFormInput(1).val(line2);
      formContainer.getFormInput(2).val(line3);
      formContainer.getFormInput(3).val(postTown);
      formContainer.getFormInput(4).val(postcode);
    };

    return {
      fillForm,
    };
  };

  const AddressFormContainer = () => {

    const toggleForm = (flag) => {
      const container = getFormContainer();
      const addressManuallyHref = getAnchorElement();
      const displayNone = 'govuk-!-display-none';

      flag ? container.removeClass(displayNone) : container.addClass(displayNone);
      flag ? addressManuallyHref.addClass(displayNone) : addressManuallyHref.removeClass(displayNone);
      container.attr('aria-hidden', !flag);
      addressManuallyHref.attr('aria-hidden', flag);
    };

    const getFormContainer = () => appSettings.container.find('.address-form');
    const getFormInput = (index) => appSettings.container.find(`.address-form input:eq(${index})`);
    const getAnchorElement = () => appSettings.container.find('a');

    return {
      toggleForm,
      getFormContainer,
      getFormInput,
      getAnchorElement,
    };
  };

  // -- Initialize -------------
  const ajax = Ajax();
  const selectMenu = SelectMenu();
  const formContainer = AddressFormContainer();
  const addressForm = AddressForm();
  FindAddress.init();

})();
