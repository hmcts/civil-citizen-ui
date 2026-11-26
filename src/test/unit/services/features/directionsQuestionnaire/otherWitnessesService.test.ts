import {getOtherWitnesses} from '../../../../../main/services/features/directionsQuestionnaire/otherWitnessesService';
import {getCaseDataFromStore, generateRedisKey} from '../../../../../main/modules/draft-store/draftStoreService';
import * as responseDraftStoreService from '../../../../../main/modules/draft-store/response/responseDraftStoreService';
import {OtherWitnesses} from '../../../../../main/common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import civilClaimResponseExpertAndWitnessMock from '../../../../utils/mocks/civilClaimResponseExpertAndWitnessMock.json';
import {Witnesses} from '../../../../../main/common/models/directionsQuestionnaire/witnesses/witnesses';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;

describe('Other witnesses service', () => {
  describe('Get other witnesses', () => {
    const req = {
      params: {id: '12345'},
      session: {user: {id: 'userId'}},
    } as unknown as AppRequest;

    beforeEach(() => {
      jest.clearAllMocks();
      mockGenerateRedisKey.mockReturnValue('12345userId');
      mockGetCaseDataFromStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(new Claim());
    });

    it('should return other witnesses from draft store if present', async () => {
      const claim = Object.assign(new Claim(), civilClaimResponseExpertAndWitnessMock.case_data);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getOtherWitnesses(req);

      expect(form.witnessItems?.length).toBe(2);
      expect(form.option).toBe('');
      expect(form.witnessItems[0]?.firstName).toEqual('John');
      expect(form.witnessItems[0]?.lastName).toEqual('Doe');
      expect(form.witnessItems[1]?.firstName).toEqual('Jane');
      expect(form.witnessItems[1]?.lastName).toEqual('Smith');
    });

    it('should return new form when no data existing on draft store', async () => {
      const claim = new Claim();
      const mockDetails = new OtherWitnesses(undefined, []);
      claim.directionQuestionnaire = <DirectionQuestionnaire>{
        witnesses: {
          otherWitnesses: mockDetails,
        },
      };
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getOtherWitnesses(req);

      expect(form).toBeTruthy();
      expect(form.witnessItems?.length).toBe(0);
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toEqual([]);
    });

    it('should return new form when no otherWitnesses existing on draft store', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = <DirectionQuestionnaire>{
        witnesses: {
          otherWitnesses: new OtherWitnesses(),
        },
      };
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getOtherWitnesses(req);

      expect(form).toBeTruthy();
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toBeUndefined();
    });

    it('should return new form when no witnesses existing on draft store', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = <DirectionQuestionnaire>{
        witnesses: new Witnesses(),
      };
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getOtherWitnesses(req);

      expect(form).toBeTruthy();
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toBeUndefined();
    });

    it('should return new form when no directionQuestionnaire existing on draft store', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getOtherWitnesses(req);

      expect(form).toBeTruthy();
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toBeUndefined();
    });

    it('should throw an error when error is thrown from draft store', async () => {
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getOtherWitnesses(req)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
