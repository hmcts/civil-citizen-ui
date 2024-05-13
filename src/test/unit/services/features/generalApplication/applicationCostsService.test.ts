import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { YesNo } from 'common/form/models/yesNo';
import { CivilServiceClient } from 'client/civilServiceClient';
import { getApplicationCostsContent } from 'services/features/generalApplication/applicationCostsService';
import * as requestModels from 'models/AppRequest';

jest.mock('../../../../../main/app/client/civilServiceClient');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockImplementation(() => Promise.resolve(123));

describe('Application costs service', () => {
  it('should get generic application type content successfully', async () => {
    //When
    const content = await getApplicationCostsContent(ApplicationTypeOption.EXTEND_TIME, YesNo.YES, YesNo.YES, 'en', mockedAppRequest);
    //Then
    expect(content.length).toEqual(2);
    expect(content[0].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY_MULTIPLE');
    expect(content[0].data.variables.applicationFee).toEqual(123);
    expect(content[1].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.FEE_NEED_TO_BE_PAID');
  });

  it('should get specific application type content successfully', async () => {
    //When
    const content = await getApplicationCostsContent(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, YesNo.YES, YesNo.YES, 'en', mockedAppRequest);
    //Then
    expect(content.length).toEqual(2);
    expect(content[0].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TO_APPLY');
    expect(content[0].data.variables.applicationFee).toEqual(123);
    expect(content[1].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.FEE_NEED_TO_BE_PAID');
  });
});
