import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {debtPaymentEvidenceService} from 'services/features/generalApplication/certOfSorC/debtPaymentEvidenceService';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const claim = new Claim();

describe('DebtPaymentEvidenceService', () => {
  it('save debt payment evidence', async () => {
    mockGetCaseDataFromDraftStore.mockImplementation(async () => {
      return claim;
    });
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

    await debtPaymentEvidenceService.saveDebtPaymentEvidence('id', {evidence: debtPaymentOptions.UPLOAD_EVIDENCE});
    expect(spyGetCaseDataFromStore).toBeCalled();
  });
});
