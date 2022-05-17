import * as draftStoreService from '../../../../main/modules/draft-store/draftStoreService';
import {getEvidence, saveEvidence} from '../../../../main/modules/evidence/evidenceService';
import { Claim } from '../../../../main/common/models/claim';
import { EvidenceType } from '../../../../main/common/models/evidence/evidenceType';
import { Evidence } from '../../../../main/common/form/models/evidence/evidence';
import { EvidenceItem } from '../../../../main/common/form/models/evidence/evidenceItem';
import {TestMessages} from '../../../../test/utils/errorMessageTestConstants';

jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const COMMENT = 'Nam ac ante id turpis elementum laoreet. Nunc a erat nec eros iaculis lobortis ut in quam.';
const EVIDENCE_ITEM = [
  { 'type': EvidenceType.CONTRACTS_AND_AGREEMENTS, 'description': 'Test evidence details' },
  { 'type': null, 'description': ''},
  { 'type': null, 'description': ''},
  { 'type': null, 'description': ''},
];

const EVIDENCE_ITEM_EMPTY: EvidenceItem[] = [
  { 'type': null, 'description': '' },
  { 'type': null, 'description': '' },
  { 'type': null, 'description': '' },
  { 'type': null, 'description': '' }];

describe('Evidence Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getEvidence', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getEvidence('123');
      //Then
      expect(form.comment).toBeUndefined();
      expect(form.evidenceItem).toEqual(EVIDENCE_ITEM_EMPTY);
    });

    it('should get empty form when evidence does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.evidence = {
          comment: '',
          evidenceItem: [],
        };
        return claim;
      });
      //When
      const form = await getEvidence('123');
      //Then
      expect(form.comment).toEqual('');
      expect(form.evidenceItem).toEqual([]);
    });
  });

  it('should return populated form when evidence exists', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.evidence = {
        comment: COMMENT,
        evidenceItem: EVIDENCE_ITEM,
      };
      return claim;
    });
    //When
    const form = await getEvidence('123');

    //Then
    expect(form.comment).toEqual(COMMENT);
    expect(form.evidenceItem).toEqual(EVIDENCE_ITEM);
  });

  it('should rethrow error when error occurs', async () => {
    //When
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(getEvidence('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });

  describe('saveEvidence', () => {
    const eventItems: EvidenceItem[] = [];
    beforeEach(() => {
      eventItems.push({ type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Test evidence details' });
    });
    it('should save evidence data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveEvidence('123', new Evidence(
        COMMENT,
        eventItems,
      ));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveEvidence('123', new Evidence(
        COMMENT,
        eventItems,
      ))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveEvidence('123', new Evidence(
        COMMENT,
        eventItems,
      ))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
