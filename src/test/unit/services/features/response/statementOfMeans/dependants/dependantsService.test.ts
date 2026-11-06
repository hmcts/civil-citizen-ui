import dependantsService from 'services/features/response/statementOfMeans/dependants/dependantsService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

describe('Dependants service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Serialisation', () => {
    it('should set declared to true when Yes option is selected', async () => {
      const dependants = dependantsService.buildDependants('yes');
      expect(dependants.declared).toBe(true);
    });
    it('should set declared to false when `No` option is selected', async () => {
      const dependants = dependantsService.buildDependants('no');
      expect(dependants.declared).toBe(false);
    });
    it('should set declared to undefined when no option is selected', async () => {
      const dependants = dependantsService.buildDependants(null);
      expect(dependants.declared).toBe(undefined);
    });
    it('should keep the form input values unchanged after validation', async () => {
      const dependants = dependantsService.buildDependants('yes', '0', '0', '0');
      expect(dependants.declared).toBe(true);
      expect(dependants.numberOfChildren?.under11).toBe(0);
      expect(dependants.numberOfChildren?.between11and15).toBe(0);
      expect(dependants.numberOfChildren?.between16and19).toBe(0);
    });
    it('should keep the form input values unchanged after validation with invalid numbers', async () => {
      const dependants = dependantsService.buildDependants('yes', '--', '-', '+');
      expect(dependants.declared).toBe(true);
      expect(dependants.numberOfChildren?.under11).toBeUndefined();
      expect(dependants.numberOfChildren?.between11and15).toBeUndefined();
      expect(dependants.numberOfChildren?.between16and19).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should not raise any error if declared is false and number of children unspecified', async () => {
      const form = dependantsService.validateDependants(new Dependants(false, undefined));
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise any error if declared is true and number of children unspecified', async () => {
      const form = dependantsService.validateDependants(new Dependants(true, undefined));
      expect(form.getErrors().length).toBe(1);
    });
    it('should raise an error if declared is true and none of the age ranges is specified', async () => {
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      const form = dependantsService.validateDependants(new Dependants(true, numberOfChildren));
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toEqual({AtLeastOneFieldIsPopulatedConstraint: 'ERRORS.VALID_ENTER_AT_LEAST_ONE_NUMBER'});
    });
    it('should raise no error if declared true and one age range is specified', async () => {
      const numberOfChildren = new NumberOfChildren(1, undefined, undefined);
      const form = dependantsService.validateDependants(new Dependants(true, numberOfChildren));
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise an error if declared true and one age range has a negative value', async () => {
      const numberOfChildren = new NumberOfChildren(-1, undefined, undefined);
      const form = dependantsService.validateDependants(new Dependants(true, numberOfChildren));
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toBeUndefined();
      expect(form.getNestedErrors()[0].property).toBe('numberOfChildren[under11]');
      expect(form.getNestedErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_POSITIVE_NUMBER'});
    });
    it('should raise an error if declared true and one age range has a decimal value', async () => {
      const numberOfChildren = new NumberOfChildren(undefined, 1.5, undefined);
      const form = dependantsService.validateDependants(new Dependants(true, numberOfChildren));
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toBeUndefined();
      expect(form.getNestedErrors()[0].property).toBe('numberOfChildren[between11and15]');
      expect(form.getNestedErrors()[0].constraints).toEqual({isInt: 'ERRORS.VALID_INTEGER'});
    });
    it('should raise 3 errors if declared true and 3 age ranges aren\'t valid', async () => {
      const numberOfChildren = new NumberOfChildren(-1, 1.5, -2);
      const form = dependantsService.validateDependants(new Dependants(true, numberOfChildren));
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toBeUndefined();
      expect(form.getNestedErrors().length).toBe(3);
      expect(form.getNestedErrors()[0].property).toBe('numberOfChildren[under11]');
      expect(form.getNestedErrors()[0].constraints).toEqual({min: 'ERRORS.VALID_POSITIVE_NUMBER'});
      expect(form.getNestedErrors()[1].property).toBe('numberOfChildren[between11and15]');
      expect(form.getNestedErrors()[1].constraints).toEqual({isInt: 'ERRORS.VALID_INTEGER'});
      expect(form.getNestedErrors()[2].property).toBe('numberOfChildren[between16and19]');
      expect(form.getNestedErrors()[2].constraints).toEqual({min: 'ERRORS.VALID_POSITIVE_NUMBER'});
    });
  });

  describe('getDependants', () => {
    it('should return empty dependants when not set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const dependants = await dependantsService.getDependants(mockReq);

      expect(dependants).toEqual(new Dependants());
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return populated dependants when they exist', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.dependants = new Dependants(true, new NumberOfChildren(1, 0, 0));
      mockGetResponseClaimById.mockResolvedValue(claim);

      const dependants = await dependantsService.getDependants(mockReq);

      expect(dependants.declared).toBe(true);
      expect(dependants.numberOfChildren?.under11).toBe(1);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(dependantsService.getDependants(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDependants', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(dependantsService.saveDependants(mockReq, new Dependants(false)))
        .rejects.toThrow('[dependantsService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dependants = new Dependants(true, new NumberOfChildren(1, 0, 0));

      const claim = await dependantsService.saveDependants(mockReq, dependants);

      expect(claim.statementOfMeans?.dependants).toEqual(dependants);
      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({dependants}),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save when statement of means already exists', async () => {
      const existingClaim = new Claim();
      existingClaim.statementOfMeans = new StatementOfMeans();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(existingClaim));
      mockUpdateResponseDraft.mockResolvedValue({});
      const dependants = new Dependants(false);

      const claim = await dependantsService.saveDependants(mockReq, dependants);

      expect(claim.statementOfMeans?.dependants).toEqual(dependants);
      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({dependants}),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(dependantsService.saveDependants(mockReq, new Dependants(false)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Redirection Logic', () => {
    it('should redirect to other dependants screen', async () => {
      const dependants = new Dependants(true);
      expect(dependants.hasChildrenBetween16and19()).toBe(false);
    });
    it('should redirect to dependants education screen when number of children between 16 and 19 is  0', async () => {
      const numberOfChildren = new NumberOfChildren(undefined, undefined, 0);
      const dependants = new Dependants(true, numberOfChildren);
      expect(dependants.hasChildrenBetween16and19()).toBe(false);
    });
    it('should redirect to dependants education screen when number of children between 16 and 19 is greater than 0', async () => {
      const numberOfChildren = new NumberOfChildren(undefined, undefined, 1);
      const dependants = new Dependants(true, numberOfChildren);
      expect(dependants.hasChildrenBetween16and19()).toBe(true);
    });
  });
});
