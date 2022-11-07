import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {
  constructBanksAndSavingsAccountSection,
  getClaimantResponse,
  saveClaimantResponse,
} from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {ClaimantResponse} from '../../../../../main/common/models/claimantResponse';
import {getLng} from '../../../../../main/common/utils/languageToggleUtils';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/common/utils/languageToggleUtils');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const languageMock = getLng as jest.Mock;

describe('Claimant Response Service', () => {
  describe('getClaimantResponse', () => {
    it('should return undefined if direction claimant response is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const claimantResponse = await getClaimantResponse('validClaimId');
      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object with hasDefendantPaidYou no', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.NO);
    });

    it('should return Claimant Response object with hasDefendantPaidYou yes', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.YES,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.YES);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getClaimantResponse('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantResponse', () => {
    const claimantResponse = new ClaimantResponse();
    claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);

    it('should save claimant response successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        return claim;
      });

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claimantResponseToSave = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      await saveClaimantResponse('validClaimId',  YesNo.NO, 'option', 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToSave});
    });

    it('should update claim determination successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = claimantResponse;
        return claim;
      });
      const claimantResponseToUpdate = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveClaimantResponse('validClaimId', claimantResponse?.hasDefendantPaidYou.option, 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantResponse: claimantResponseToUpdate});
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveClaimantResponse('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('constructBanksAndSavingsAccountSection', () => {
    const noBorderClass = 'govuk-summary-list__row--no-border';
    const emptyObject = {text: ''};

    beforeAll(() => {
      languageMock.mockImplementation(() => 'cimode');
    });

    it('should return empty values if statement of means does not have bank and savings account data', () => {
      const response = constructBanksAndSavingsAccountSection(new Claim(), 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.ACCOUNT_TYPE',
          },
          value: emptyObject,
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.BALANCE',
          },
          value: emptyObject,
        },
        {
          key: {
            text: 'COMMON.BANK_JOINT_ACCOUNT',
          },
          value: emptyObject,
        },
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHERE_THEY_LIVE',
          },
          value: {
            text: undefined,
          },
        },
      ];
      expect(response).toStrictEqual(expectedData);
    });
  });
});
