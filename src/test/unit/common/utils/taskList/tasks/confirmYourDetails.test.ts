import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CITIZEN_DETAILS_URL,
} from 'routes/urls';
import {Party} from 'models/party';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {getConfirmYourDetailsTask} from 'common/utils/taskList/tasks/confirmYourDetails';
import {
  hasAllCarmRequiredFields,
  hasCorrespondenceAndPrimaryAddress,
  hasDateOfBirthIfIndividual,
} from 'common/utils/taskList/tasks/taskListHelpers';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('../../../../../../main/common/utils/taskList/tasks/taskListHelpers');

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const hasCorrespondenceAndPrimaryAddressMock = hasCorrespondenceAndPrimaryAddress as jest.Mock;
const hasDateOfBirthIfIndividualMock = hasDateOfBirthIfIndividual as jest.Mock;
const hasAllCarmRequiredFieldsMock = hasAllCarmRequiredFields as jest.Mock;
describe('Confirm your details', () => {
  let claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: t('COMMON.CONFIRM_YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL),
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = {
    description: t('COMMON.CONFIRM_YOUR_DETAILS', { lng: getLng(lang) }),
    url: constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL),
    status: TaskStatus.COMPLETE,
  };

  beforeEach(() => {
    claim = new Claim();
    claim.respondent1 = new Party();
    jest.clearAllMocks();
  });

  describe('getConfirmYourDetailsTask', () => {

    it('should return complete when carm flag is off and hasCorrespondenceAndPrimaryAddress and hasDateOfBirthIfIndividual are true', () => {
      hasCorrespondenceAndPrimaryAddressMock.mockImplementation(() => true);
      hasDateOfBirthIfIndividualMock.mockImplementation(() => true);
      const availabilityForMediationTask = getConfirmYourDetailsTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultComplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultComplete.description);
      expect(availabilityForMediationTask.status).toEqual(resultComplete.status);
    });

    it('should return incomplete when carm flag is off and hasCorrespondenceAndPrimaryAddress and hasDateOfBirthIfIndividual are false', () => {
      hasCorrespondenceAndPrimaryAddressMock.mockImplementation(() => false);
      hasDateOfBirthIfIndividualMock.mockImplementation(() => false);
      const availabilityForMediationTask = getConfirmYourDetailsTask(claim, claimId, lang);
      expect(availabilityForMediationTask.url).toEqual(resultIncomplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultIncomplete.description);
      expect(availabilityForMediationTask.status).toEqual(resultIncomplete.status);
    });

    it('should return complete when carm flag is on and hasCorrespondenceAndPrimaryAddress and hasDateOfBirthIfIndividual and hasAllCarmRequiredFields are true', () => {
      hasCorrespondenceAndPrimaryAddressMock.mockImplementation(() => true);
      hasDateOfBirthIfIndividualMock.mockImplementation(() => true);
      hasAllCarmRequiredFieldsMock.mockImplementation(() => true);
      const availabilityForMediationTask = getConfirmYourDetailsTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultComplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultComplete.description);
      expect(availabilityForMediationTask.status).toEqual(resultComplete.status);
    });

    it('should return complete when carm flag is on and hasCorrespondenceAndPrimaryAddress and hasDateOfBirthIfIndividual and hasAllCarmRequiredFields are false', () => {
      hasCorrespondenceAndPrimaryAddressMock.mockImplementation(() => false);
      hasDateOfBirthIfIndividualMock.mockImplementation(() => false);
      hasAllCarmRequiredFieldsMock.mockImplementation(() => false);
      const availabilityForMediationTask = getConfirmYourDetailsTask(claim, claimId, lang, true);
      expect(availabilityForMediationTask.url).toEqual(resultIncomplete.url);
      expect(availabilityForMediationTask.description).toEqual(resultIncomplete.description);
      expect(availabilityForMediationTask.status).toEqual(resultIncomplete.status);
    });

  });
});
