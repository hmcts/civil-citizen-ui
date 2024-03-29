import {courtOrdersService}
  from 'services/features/response/statementOfMeans/courtOrders/courtOrdersService';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {StatementOfMeans} from 'models/statementOfMeans';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const DRAFT_STORE_GET_ERROR = 'draft store get error';
const DRAFT_STORE_SAVE_ERROR = 'draft store save error';

describe('Court Orders service', () => {
  describe('Serialisation', () => {
    it('should set declared to true when \'Yes\' option is selected', async () => {
      //Given
      const value = {
        declared: 'yes',
      };
      //When
      const courtOrders = courtOrdersService.buildCourtOrders(value);
      //Then
      expect(courtOrders.declared).toBe(true);
    });
    it('should set declared to false when \'No\' option is selected', async () => {
      //Given
      const value = {declared: 'no'};
      //When
      const courtOrders = courtOrdersService.buildCourtOrders(value);
      //Then
      expect(courtOrders.declared).toBe(false);
    });
    it('should set declared to undefined when no option is selected', async () => {
      //Given
      const value = {};
      //When
      const courtOrders = courtOrdersService.buildCourtOrders(value);
      //Then
      expect(courtOrders.declared).toBe(undefined);
    });
    it('should set courtOrders object to undefined when the form input value is undefined', async () => {
      //Given
      const courtOrders = courtOrdersService.buildCourtOrders(undefined);
      //Then
      expect(courtOrders).toBeUndefined();
    });
    it('should set rows attribute of courtOrders object to undefined when the rows unspecified in form', async () => {
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
    it('should raise any error if declared is unspecified', async () => {
      //Given
      const courtOrders = new CourtOrders(undefined);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('declared')).toBe('ERRORS.VALID_YES_NO_SELECTION');
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    it('should not raise any error if declared is false and rows unspecified', async () => {
      //Given
      const courtOrders = new CourtOrders(false, undefined);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise an error if declared true and rows are empty', async () => {
      //Given
      const courtOrders = new CourtOrders(true, []);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBe('ERRORS.VALID_ENTER_AT_LEAST_ONE_COURT_ORDER');
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    it('should raise an error if declared true and claim number is empty', async () => {
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
      expect(form.errorFor('rows[0][claimNumber]')).toBe('ERRORS.VALID_CLAIM_NUMBER');
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    it('should raise an error if declared true and the amount is unspecified', async () => {
      //Given
      const rows = [
        new CourtOrder(undefined, 1, 'abc1'),
      ];
      const courtOrders = new CourtOrders(true, rows);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBe('ERRORS.AMOUNT_REQUIRED');
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    it('should raise an error if declared true and the amount is less than 1', async () => {
      //Given
      const rows = [
        new CourtOrder(.99, 1, 'abc1'),
      ];
      const courtOrders = new CourtOrders(true, rows);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBe('ERRORS.AMOUNT_REQUIRED');
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    it('should raise an error if declared true and the amount has more than 2 decimals', async () => {
      //Given
      const rows = [
        new CourtOrder(1.001, 1, 'abc1'),
      ];
      const courtOrders = new CourtOrders(true, rows);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    it('should raise an error if declared true and the instalment amount is unspecified', async () => {
      //Given
      const rows = [
        new CourtOrder(1, undefined, 'abc1'),
      ];
      const form = new GenericForm(new CourtOrders(true, rows));
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBe('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER');
    });
    it('should not raise an error if declared true and the instalment amount is 0', async () => {
      //Given
      const rows = [
        new CourtOrder(1, 0, 'abc1'),
      ];
      const courtOrders = new CourtOrders(true, rows);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBeUndefined();
    });
    it('should raise an error if declared true and the instalment amount has more than 2 decimals', async () => {
      //Given
      const rows = [
        new CourtOrder(1, 0.001, 'abc1'),
      ];
      const courtOrders = new CourtOrders(true, rows);
      const form = new GenericForm(courtOrders);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBeUndefined();
      expect(form.errorFor('rows[0][instalmentAmount]')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });
    it('should raise an error if declared true and none of the total and instalment amounts aren\'t specified', async () => {
      //Given
      const form = new GenericForm(new CourtOrders(true, [new CourtOrder(undefined, undefined, 'abc1')]));
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('declared')).toBeUndefined();
      expect(form.errorFor('rows')).toBeUndefined();
      expect(form.errorFor('rows[0][claimNumber]')).toBeUndefined();
      expect(form.errorFor('rows[0][amount]')).toBe('ERRORS.AMOUNT_REQUIRED');
      expect(form.errorFor('rows[0][instalmentAmount]')).toBe('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER');
    });
  });
  describe('Remove Empty Court Orders', () => {

    it('should remove empty court orders form submitted form', async () => {
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

    it('should return court orders from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
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

    it('should return court orders from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return new Claim();
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

    it('should throw error when retrieving data from draft store fails', async () => {
      //When
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(DRAFT_STORE_GET_ERROR);
      });
      //Then
      await expect(
        courtOrdersService.getCourtOrders('claimId')).rejects.toThrow(DRAFT_STORE_GET_ERROR);
    });

    it('should throw error when saving data to draft store fails', async () => {
      //When
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return {statementOfMeans: {}};
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
