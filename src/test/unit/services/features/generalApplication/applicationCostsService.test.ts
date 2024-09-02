import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { getApplicationCostsContent } from 'services/features/generalApplication/applicationCostsService';

describe('Application costs service', () => {
  it('should get generic application type content successfully', () => {
    const gaFeeData = {
      calculatedAmountInPence: 1000,
      code: 'Fe123',
      version: 0,
    };
    //When
    const content = getApplicationCostsContent([{ option: ApplicationTypeOption.EXTEND_TIME, isOtherSelected: () => false }], gaFeeData, 'en');
    //Then
    expect(content.length).toEqual(2);
    expect(content[0].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY_MULTIPLE');
    expect(content[0].data.variables.applicationFee).toEqual(10);
    expect(content[1].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.FEE_NEED_TO_BE_PAID');
  });

  it('should get specific application type content successfully', () => {
    const gaFeeData = {
      calculatedAmountInPence: 1400,
      code: 'Fe124',
      version: 0,
    };
    //When
    const content = getApplicationCostsContent([{ option: ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, isOtherSelected: () => false }], gaFeeData, 'en');
    //Then
    expect(content.length).toEqual(2);
    expect(content[0].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY');
    expect(content[0].data.variables.applicationFee).toEqual(14);
    expect(content[1].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.FEE_NEED_TO_BE_PAID');
  });
});
