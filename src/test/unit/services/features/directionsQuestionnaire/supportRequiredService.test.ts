import {
  getSupportRequired,
  saveSupportRequired,
} from '../../../../../main/services/features/directionsQuestionnaire/supportRequiredService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';

import {
  NO_LANGUAGE_ENTERED,
  TEXT_TOO_LONG,
} from '../../../../../main/common/form/validationErrors/errorMessageConstants';
import {SupportRequired} from '../../../../../main/common/models/directionsQuestionnaire/supportRequired';
import {GenericForm} from '../../../../../main/common/form/models/genericForm';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const DRAFT_STORE_GET_ERROR = 'draft store get error';
const DRAFT_STORE_SAVE_ERROR = 'draft store save error';

describe('Support Required service', () => {
  describe('Validation', () => {
    test('should not raise any error if no support option selected', async () => {
      //Given
      const supportRequired = new SupportRequired(false, undefined, false, undefined, false, false ,false, undefined);
      //When
      const form = new GenericForm(supportRequired);
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if languageSelected is true and languageInterpreted undefined', async () => {
      //Given
      const supportRequired = new SupportRequired(true, undefined, false, undefined, false, false ,false, undefined);
      //When
      const form = new GenericForm(supportRequired);
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('languageInterpreted');
      expect(form.getErrors()[0].constraints).toEqual({isDefined: NO_LANGUAGE_ENTERED, maxLength: TEXT_TOO_LONG, isNotEmpty : NO_LANGUAGE_ENTERED});
    });
    test('should raise an error if languageSelected is true and languageInterpreted empty', async () => {
      //Given
      const supportRequired = new SupportRequired(true, '', false, undefined, false, false ,false, undefined);
      //When
      const form = new GenericForm(supportRequired);
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('languageInterpreted');
      expect(form.getErrors()[0].constraints).toEqual({isNotEmpty: NO_LANGUAGE_ENTERED});
    });
    test('should raise no error if languageSelected true and languageInterpreted is specified', async () => {
      //Given
      const supportRequired = new SupportRequired(true, 'Croatian', false, undefined, false, false ,false, undefined);
      //When
      const form = new GenericForm(supportRequired);
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(0);
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
          getSupportRequired('claimId')).rejects.toThrow(DRAFT_STORE_GET_ERROR);
      });

      test('should throw error when saving data to draft store fails', async () => {
      //When
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return {case_data: {supportRequired: {}}};
        });
        mockSaveDraftClaim.mockImplementation(async () => {
          throw new Error(DRAFT_STORE_SAVE_ERROR);
        });
        //Then
        await expect(
          saveSupportRequired('claimId', new SupportRequired())).rejects.toThrow(DRAFT_STORE_SAVE_ERROR);
      });
    });
  });
});
