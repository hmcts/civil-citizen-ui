import I = CodeceptJS.I
import { ResponseSteps } from '../features/response/steps/prepareYourResponse';
import {config} from '../../config';

const responseSteps: ResponseSteps = new ResponseSteps();
const claimRef = '1645882162449409';
Feature('Response with AdmitAll and Immediate Payment');

// Scenario('Create claim', async ({I, api}) => {
//   await api.createClaimWithUnregisteredSolicitor(config.applicantSolicitorUser, mpScenario);
// });

Scenario('Enter confirm your details @citizenUI', async (I:I) => {
  responseSteps.VerifyResponsePageContent(claimRef);
  responseSteps.EnterConfirmYourDetails(claimRef);
  responseSteps.EnterDateOfBirth(claimRef);
  responseSteps.EnterContactNumber(claimRef);
});


