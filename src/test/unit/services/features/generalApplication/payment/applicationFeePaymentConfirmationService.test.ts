import * as requestModels from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
jest.mock('modules/draft-store');
jest.mock('modules/draft-store/courtLocationCache');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');

declare const appRequest: requestModels.AppRequest;

describe('Application Fee PaymentConfirmation Service', () => {
  app.locals.draftStoreClient = mockCivilClaim;
  jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
});
