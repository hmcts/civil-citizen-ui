import {getClaimBusinessProcess} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {BusinessProcess} from 'models/businessProcess';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKey:jest.fn,
}));

describe('Utility service', () => {
  describe('getClaimBusinessProcess', () => {
    const mockRequest = { params: { id: '12345' } } as unknown as AppRequest;

    it('should return business process', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234';
      const businessProcess = new BusinessProcess();
      const FINISHED = 'FINISHED';
      const CREATE_CLAIM_SPEC = 'CREATE_CLAIM_SPEC';
      businessProcess.status = FINISHED;
      businessProcess.camundaEvent = CREATE_CLAIM_SPEC;
      claim.businessProcess = businessProcess;

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(claim);
      //when
      const results = await getClaimBusinessProcess(claim.id, mockRequest);
      //Then
      expect(results.status).toEqual(FINISHED);
      expect(results.camundaEvent).toEqual(CREATE_CLAIM_SPEC);
    });

    it('should throw Error if case not found', async () => {
      //Given
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(undefined);
      try {
        //when
        await getClaimBusinessProcess('1234', mockRequest);
      } catch (error) {
        //Then
        expect(error.message).toEqual('Case not found...');
      }
    });
  });
});
