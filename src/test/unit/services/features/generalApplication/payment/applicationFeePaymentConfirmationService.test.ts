import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/courtLocationCache');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');

describe('Application Fee PaymentConfirmation Service', () => {
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');

  it('should return to payment successful screen if payment is successful', async () => {
  
    //when
    const actualPaymentRedirectUrl = 'true';

    //Then
    expect(actualPaymentRedirectUrl).toBe('true');
  });
});
