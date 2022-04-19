import courtOrdersService
  from '../../../../../../../main/services/features/response/statementOfMeans/courtOrders/courtOrdersService';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../../../main/common/models/statementOfMeans';
import {CourtOrders} from '../../../../../../../main/common/form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from '../../../../../../../main/common/form/models/statementOfMeans/courtOrders/courtOrder';
import {Claim} from '../../../../../../../main/common/models/claim';
import {CivilClaimResponse} from '../../../../../../../main/common/models/civilClaimResponse';
import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import {
  VALID_AMOUNT,
  VALID_AMOUNT_ONE_POUND_OR_MORE,
  VALID_CLAIM_NUMBER,
  VALID_ENTER_AT_LEAST_ONE_COURT_ORDER,
  VALID_YES_NO_SELECTION,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getDraftClaimFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const DRAFT_STORE_GET_ERROR = 'draft store get error';
const DRAFT_STORE_SAVE_ERROR = 'draft store save error';

describe('Court Orders service', () => {
  describe('Serialisation', () => {
    test('should set declared to true when \'Yes\' option is selected', async () => {
      //Given
      const value = {
        declared: 'yes',
      };
      //When
      const courtOrders = courtOrdersService.buildCourtOrders(value);
      //Then
      expect(courtOrders.declared).toBe(true);
    });
    test('should set declared to false when \'No\' option is selected', async () => {
      //Given
      const value = {declared: 'no'};
      //When
      const courtOrders = courtOrdersService.buildCourtOrders(value);
      //Then
      expect(courtOrders.declared).toBe(false);
    });
    test('should set declared to undefined when no option is selected', async () => {
      //Given
      const value = {};
      //When
      const courtOrders = courtOrdersService.buildCourtOrders(value);
      //Then
      expect(courtOrders.declared).toBe(undefined);
    });
    test('should set courtOrders object to undefined when the form input value is undefined', async () => {
      //Given
      const courtOrders = courtOrdersService.buildCourtOrders(undefined);
      //Then
      expect(courtOrders).toBeUndefined();
    });
    test('should set rows attribute of courtOrders object to undefined when the rows unspecified in form', async () => {
      //Given
      const value = {
        declared: 'yes',
      };
      const courtOrders = courtOrdersService.buildCourtOrders(value);
      //Then
      expect(courtOrders.declared).toBe(true);
      expect(courtOrders.rows).toEqual([]);
    });
  });
  describe('Validation', () => {
    test('should raise any error if declared is unspecified', async () => {
      //Given
      const courtOrders = new CourtOrders(undefined);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('declared')).toBe(VALID_YES_NO_SELECTION);
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    test('should not raise any error if declared is false and rows unspecified', async () => {
      //Given
      const courtOrders = new CourtOrders(false, undefined);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if declared true and rows are empty', async () => {
      //Given
      const courtOrders = new CourtOrders(true, []);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBe(VALID_ENTER_AT_LEAST_ONE_COURT_ORDER);
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    test('should raise an error if declared true and claim number is empty', async () => {
      //Given
      const rows = [
        new CourtOrder(120, 10, ''),
      ];
      const courtOrders = new CourtOrders(true, rows);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBe(VALID_CLAIM_NUMBER);
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    test('should raise an error if declared true and an amount is null or less than 1', async () => {
      //Given
      const rows = [
        new CourtOrder(.99, undefined, 'abc1'),
      ];
      const courtOrders = new CourtOrders(true, rows);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBe(VALID_AMOUNT_ONE_POUND_OR_MORE);
      expect(form.errorFor('rows[0][instalmentAmount]')).toBe(VALID_AMOUNT);
    });
  });
  describe('Remove Empty Court Orders', () => {

    test('should remove empty court orders form submitted form', async () => {
      //Given
      const courtOrder: CourtOrder = new CourtOrder(120, 10, 'abc1');
      const emptyCourtOrder: CourtOrder = new CourtOrder(undefined, undefined, undefined);
      const rows = [
        emptyCourtOrder,
        courtOrder,
        emptyCourtOrder,
      ];
      const courtOrders = new CourtOrders(true, rows);
      //When
      courtOrdersService.removeEmptyCourtOrders(courtOrders);
      //Then
      expect(courtOrders.rows.length).toBe(1);
      expect(courtOrders.rows[0].claimNumber).toBe('abc1');
      expect(courtOrders.rows[0].amount).toBe(120);
      expect(courtOrders.rows[0].instalmentAmount).toBe(10);
    });
  });
  describe('Get Court Orders', () => {

    test('should return court orders from draft store if present', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return createClaimWithCourtOrders();
      });
      //When
      const courtOrders = await courtOrdersService.getCourtOrders('abc1');
      //Then
      expect(courtOrders).toBeTruthy();
      expect(courtOrders.declared).toBe(true);
      expect(courtOrders.rows).toEqual([]);
    });
  });
  describe('Save Court Orders', () => {

    test('should return court orders from draft store if present', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const response = new CivilClaimResponse();
        response.case_data = new Claim();
        return response;
      });
      const courtOrders = new CourtOrders(true, []);
      //When
      await courtOrdersService.saveCourtOrders('abc1', courtOrders);
      //Then
    });
  });
  describe('Exception Handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should throw error when retrieving data from draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_GET_ERROR);
      });
      //Then
      await expect(
        courtOrdersService.getCourtOrders('claimId')).rejects.toThrow(DRAFT_STORE_GET_ERROR);
    });

    test('should throw error when saving data to draft store fails', async () => {
      //When
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return {case_data: {statementOfMeans: {}}};
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_SAVE_ERROR);
      });
      //Then
      await expect(
        courtOrdersService.saveCourtOrders('claimId', new CourtOrders())).rejects.toThrow(DRAFT_STORE_SAVE_ERROR);
    });
  });
});

function createClaimWithCourtOrders(): Claim {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.courtOrders = new CourtOrders(true, []);
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
