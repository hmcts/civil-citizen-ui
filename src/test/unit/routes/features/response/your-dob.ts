import express from 'express';
import { DraftStoreClient } from '../../../../../main/modules/draft-store';
const confirmDetailsController = require('../../../../../main/controllers/features/response/confirm-details');

export const app = express();
new DraftStoreClient().enableFor(app);

let birthdayValidated: object = {};

describe('Confirm dates', () => {
  const birthdayObj = {
    label: {
      text: 'day',
    },
    classes: 'govuk-input--width-20',
    id: 'day',
    name: 'day',
    autocomplete: 'day',
  };

  it('Validate Day when field is empty', async () => {
    birthdayValidated = confirmDetailsController.validateField('', 'Enter a number', 'day', birthdayObj);
    expect(birthdayValidated).toEqual({
      ...birthdayObj,
      errorMessage: { 'text': 'Enter a number' },
    });
  });
  it('Validate Month when field is empty', async () => {
    birthdayValidated = confirmDetailsController.validateField('', 'Enter a number', 'month', birthdayObj);
    expect(birthdayValidated).toEqual({
      ...birthdayObj,
      errorMessage: { 'text': 'Enter a number' },
    });
  });
  it('Validate Year when field is empty', async () => {
    birthdayValidated = confirmDetailsController.validateField('', 'Enter a number', 'year', birthdayObj);
    expect(birthdayValidated).toEqual({
      ...birthdayObj,
      errorMessage: { 'text': 'Enter a number' },
    });
  });
  it('Validate Day when field is not a number', async () => {
    birthdayValidated = confirmDetailsController.validateField('', 'Enter a correct number', 'day', birthdayObj);
    expect(birthdayValidated).toEqual({
      ...birthdayObj,
      errorMessage: { 'text': 'Enter a correct number' },
    });
  });
  it('Validate Month when field is not a number', async () => {
    birthdayValidated = confirmDetailsController.validateField('', 'Enter a correct number', 'month', birthdayObj);
    expect(birthdayValidated).toEqual({
      ...birthdayObj,
      errorMessage: { 'text': 'Enter a correct number' },
    });
  });
  it('Validate Year when field is not a number', async () => {
    birthdayValidated = confirmDetailsController.validateField('', 'Enter a correct number', 'year', birthdayObj);
    expect(birthdayValidated).toEqual({
      ...birthdayObj,
      errorMessage: { 'text': 'Enter a correct number' },
    });
  });


});
