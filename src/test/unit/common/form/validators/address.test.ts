import { Address } from 'common/form/models/address';
import { GenericForm } from 'common/form/models/genericForm';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';

const string51charLong = 'This is a 51 char address aAbBcCdDeEfFgGhHiIjJkKlLm';
const string50charLong = 'This is a 50 char address aAbBcCdDeEfFgGhHiIjJkKlL';
const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = 'This is a 35 char address aAbBcCdDe';
const postCode = 'EC1A 1BB';
// const stringWithLeadingAndTrailingSpaces = '  AddressLine 1  ';
// const stringWithSpecialChars = ' AddressLine ˆ ` ´ ¨ 1';

describe(('For Address Form'), () => {
  it('should not throw an error if address length OK and flag OFF', async () => {
    //Given
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);

    const address = new Address(string50charLong, string50charLong, string50charLong, string50charLong, postCode);
    const form = new GenericForm(address);
    await form.validate();
    expect(form.hasErrors()).toBeFalsy();
  });

  it('should not throw an error if address length OK and flag ON', async () => {
    //Given
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);

    const address = new Address(string35charLong, string35charLong, string35charLong, string35charLong, postCode);
    const form = new GenericForm(address);
    await form.validate();
    expect(form.hasErrors()).toBeFalsy();
  });

  it('should throw an error in case of exceeded max length and flag OFF', async () => {
    //Given
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);

    const address = new Address(string51charLong, string51charLong, string51charLong, string51charLong, postCode);
    const form = new GenericForm(address);
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.errorFor('addressLine1')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    expect(form.errorFor('addressLine2')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    expect(form.errorFor('addressLine3')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
  });

  it('should throw an error in case of exceeded max length and flag ON', async () => {
    //Given
    jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);

    const address = new Address(string36charLong, string36charLong, string36charLong, string36charLong, postCode);
    const form = new GenericForm(address);
    await form.validate();
    expect(form.hasErrors()).toBeTruthy();
    expect(form.errorFor('addressLine1')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    expect(form.errorFor('addressLine2')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    expect(form.errorFor('addressLine3')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
  });
});

