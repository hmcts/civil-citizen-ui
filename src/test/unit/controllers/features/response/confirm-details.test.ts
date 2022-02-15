import express from 'express';
import { DraftStoreClient } from '../../../../../main/modules/draft-store';
const confirmDetailsController = require('../../../../../main/controllers/features/response/confirm-details');

export const app = express();
new DraftStoreClient().enableFor(app);

let addressLineOneValidated: object = {};
let townOrCityValidated: object = {};

describe('Confirm Details', () => {
  const addressLineOneObj = {
    label: {
      text: 'Address',
    },
    classes: 'govuk-input--width-20',
    id: 'addressLineOne',
    name: 'addressLineOne',
    autocomplete: 'addressLineOne',
  };

  const townOrCityObj = {
    label: {
      text: 'Town or city',
    },
    classes: 'govuk-input--width-20',
    id: 'city',
    name: 'city',
    autocomplete: 'city',
  };

  it('Validate Address Line One', async () => {
    addressLineOneValidated = confirmDetailsController.validateField('33 Highland Road', 'Enter first address line', 'addressLineOne', addressLineOneObj);
    expect(addressLineOneValidated).toEqual({
      ...addressLineOneObj,
      value: '33 Highland Road',
    });
  });

  it('Validate Address Line One when field is empty', async () => {
    addressLineOneValidated = confirmDetailsController.validateField('', 'Enter first address line', 'addressLineOne', addressLineOneObj);
    expect(addressLineOneValidated).toEqual({
      ...addressLineOneObj,
      errorMessage: { 'text': 'Enter first address line' },
    });
  });

  it('Validate City', async () => {
    townOrCityValidated = confirmDetailsController.validateField('Birmingham', 'Enter a valid town/city', 'city', townOrCityObj);
    expect(townOrCityValidated).toEqual({
      ...townOrCityObj,
      value: 'Birmingham',
    });
  });

  it('Validate City when field is empty', async () => {
    townOrCityValidated = confirmDetailsController.validateField('', 'Enter a valid town/city', 'city', townOrCityObj);
    expect(townOrCityValidated).toEqual({
      ...townOrCityObj,
      errorMessage: { 'text': 'Enter a valid town/city' },
    });
  });
});

