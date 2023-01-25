import {request} from 'express';
import {
  generatePeopleListWithSelectedValues,
  getSupportRequired,
  getSupportRequiredForm,
  NameListType,
} from '../../../../../main/services/features/directionsQuestionnaire/supportRequiredService';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import {
  SupportRequired,
  SupportRequiredList,
  Support,
} from '../../../../../main/common/models/directionsQuestionnaire/supportRequired';
import {GenericForm} from '../../../../../main/common/form/models/genericForm';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import civilClaimResponseExpertAndWitnessMock from '../../../../utils/mocks/civilClaimResponseExpertAndWitnessMock.json';
import civilClaimantIntentionMock from '../../../../utils/mocks/civilClaimantIntentionMock.json';
import {Claim} from '../../../../../main/common/models/claim';
import {CaseState} from 'common/form/models/claimDetails';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;

describe('Support Required service', () => {
  describe('convert to support required form', () => {
    it('should convert request body successfully when option "yes" and declared is empty', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: '',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBeFalsy();
      expect(form.items[0].disabledAccess?.selected).toBeFalsy();
    });

    it('should convert request body successfully when option "yes" and declared is not empty', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: 'John Doe',
              declared: 'disabledAccess',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBe('John Doe');
      expect(form.items[0].disabledAccess?.selected).toBe(true);
    });

    it('should convert request body successfully when option "yes" and multiple declaration in one row with support text', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: 'John Doe',
              declared: ['disabledAccess', 'otherSupport'],
              otherSupport: {content: 'test'},
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBe('John Doe');
      expect(form.items[0].disabledAccess?.selected).toBe(true);
      expect(form.items[0].otherSupport?.selected).toBe(true);
      expect(form.items[0].otherSupport?.content).toBe('test');
    });

    it('should convert request body successfully when option "yes" and multiple declaration in two rows with support text', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.YES,
        model: {
          items: [
            {
              fullName: 'John Doe',
              declared: ['disabledAccess', 'otherSupport'],
              otherSupport: {content: 'test'},
            },
            {
              fullName: 'Mike Brown',
              declared: 'signLanguageInterpreter',
              signLanguageInterpreter: {content: 'sign language support'},
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('yes');
      expect(form.items[0].fullName).toBe('John Doe');
      expect(form.items[0].disabledAccess?.selected).toBe(true);
      expect(form.items[0].otherSupport?.selected).toBe(true);
      expect(form.items[0].otherSupport?.content).toBe('test');
      expect(form.items[1].fullName).toBe('Mike Brown');
      expect(form.items[1].signLanguageInterpreter?.selected).toBe(true);
      expect(form.items[1].signLanguageInterpreter?.content).toBe('sign language support');
    });

    it('should convert request body successfully when option "no" and declared is empty', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.NO,
        model: {
          items: [
            {
              fullName: '',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('no');
      expect(form.items[0].fullName).toBeUndefined();
      expect(form.items[0].disabledAccess?.selected).toBeFalsy();
    });

    it('should removed the devlared values when option changed from "no" to "yes"', () => {
      //Given
      const req = request;
      req.body = {
        option: YesNo.NO,
        model: {
          items: [
            {
              fullName: 'John Doe',
              declared: 'disabledAccess',
            },
          ],
        },
      };
      //When
      const form = getSupportRequiredForm(req);
      //Then
      expect(form).not.toBeUndefined();
      expect(form.option).toBe('no');
      expect(form.items[0].fullName).toBeUndefined();
      expect(form.items[0].disabledAccess?.selected).toBeFalsy();
    });
  });

  describe('Validation', () => {

    it('should not raise any error if option is "no" and support required list unspecified', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.NO, undefined);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(0);
    });

    it('should raise at enter person name if option "yes" and when no name is selected', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: '',
        disabledAccess: {selected: true},
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBe('ERRORS.ENTER_PERSON_NAME');
    });

    it('should raise at least error if option "yes" and name selected but no support provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'John Doe',
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBe('ERRORS.SELECT_SUPPORT');
    });

    it('should raise error if option "yes" and sign language selected but no content provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'John Doe',
        signLanguageInterpreter: new Support(
          'signLanguageInterpreter',
          true,
        ),
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][languageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][signLanguageInterpreter][content]', 'model')).toBe('ERRORS.NO_SIGN_LANGUAGE_ENTERED');
    });

    it('should raise error if option "yes" and language selected but no content provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'John Doe',
        languageInterpreter: new Support(
          'languageInterpreter',
          true,
        ),
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][signLanguageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][languageInterpreter][content]', 'model')).toBe('ERRORS.NO_LANGUAGE_ENTERED');
    });

    it('should raise error if option "yes" and other support selected but no content provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired({
        fullName: 'John Doe',
        otherSupport: new Support(
          'otherSupport',
          true,
        ),
      })]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][signLanguageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][languageInterpreter][content]', 'model')).toBeUndefined();
      expect(form.errorFor('model[items][0][otherSupport][content]', 'model')).toBe('ERRORS.NO_OTHER_SUPPORT');
    });

    it('should raise error if option "yes", name and support not provided', async () => {
      //Given
      const supportRequiredList = new SupportRequiredList(YesNo.YES, [new SupportRequired()]);
      const form = new GenericForm(supportRequiredList);
      //When
      form.validateSync();
      //Then
      expect(form.errorFor('model[items][0][fullName]', 'model')).toBe('ERRORS.ENTER_PERSON_NAME');
      expect(form.errorFor('model[items][0][checkboxGrp]', 'model')).toBe('ERRORS.SELECT_SUPPORT');
    });
  });

  describe('Get Support Required List', () => {
    const lang = 'en';
    const claimId = '1234';
    it('should return defendant support required details from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseExpertAndWitnessMock.case_data);
      });
      //When
      const supportRequiredList = await getSupportRequired(claimId);
      const selectedNames = supportRequiredList?.items?.map(item => item.fullName);
      const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames, lang);
      //Then
      if (supportRequiredList.items) {
        expect(supportRequiredList.items).toBeTruthy();
        expect(supportRequiredList.items.length).toBe(2);
        expect(supportRequiredList.items[0]?.fullName).toEqual('John Doe');
        expect(supportRequiredList.items[0].disabledAccess?.selected).toBe(true);
        expect(supportRequiredList.items[0].otherSupport?.selected).toBe(true);
        expect(supportRequiredList.items[0].otherSupport?.content).toEqual('other support text');
      }
      if (peopleLists.length) {
        const firstRow = peopleLists[0];
        const secondRow = peopleLists[1];
        expect(peopleLists.length).toBe(2);
        expect(firstRow[0].text).toBe('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME');
        expect(firstRow[1].text).toBe('John Doe');
        expect(firstRow[1].value).toBe('John Doe');
        expect(firstRow[1].selected).toBe(true);
        expect(secondRow[0].text).toBe('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME');
        expect(secondRow[3].text).toBe('Mike Brown');
        expect(secondRow[3].value).toBe('Mike Brown');
        expect(secondRow[3].selected).toBe(true);
      }
    });

    it('should return empty defendant support required details with empty dropdown from draft store if non-present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const supportRequiredList = await getSupportRequired(claimId);
      const selectedNames = supportRequiredList?.items?.map(item => item.fullName);
      const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames, lang);
      //Then
      if (supportRequiredList.items) {
        expect(supportRequiredList.items).toBeTruthy();
        expect(supportRequiredList.items.length).toBe(1);
        expect(supportRequiredList.items[0]?.fullName).toBeUndefined();
        expect(supportRequiredList.items[0].disabledAccess).toBeUndefined();
        expect(supportRequiredList.items[0].hearingLoop).toBeUndefined();
        expect(supportRequiredList.items[0].signLanguageInterpreter).toBeUndefined();
        expect(supportRequiredList.items[0].languageInterpreter).toBeUndefined();
        expect(supportRequiredList.items[0].otherSupport).toBeUndefined();
      }
      if (peopleLists.length) {
        const firstRow = peopleLists[0];
        expect(peopleLists.length).toBe(1);
        expect(firstRow[0].text).toBe('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME');
        expect(firstRow[0].value).toBe('');
        expect(firstRow[0].selected).toBe(false);
      }
    });
    it('should return claimant support required details from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = Object.assign(new Claim(), civilClaimantIntentionMock.case_data);
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      //When
      const supportRequiredList = await getSupportRequired(claimId);
      const selectedNames = supportRequiredList?.items?.map(item => item.fullName);
      const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames, lang);
      //Then
      if (supportRequiredList.items) {
        expect(supportRequiredList.items).toBeTruthy();
        expect(supportRequiredList.items.length).toBe(2);
        expect(supportRequiredList.items[0]?.fullName).toEqual('Jasmine Williams');
        expect(supportRequiredList.items[0].disabledAccess?.selected).toBe(true);
        expect(supportRequiredList.items[0].otherSupport?.selected).toBe(true);
        expect(supportRequiredList.items[0].otherSupport?.content).toEqual('other support text');
      }
      if (peopleLists.length) {
        const firstRow = peopleLists[0];
        const secondRow = peopleLists[1];
        expect(peopleLists.length).toBe(2);
        expect(firstRow[0].text).toBe('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME');
        expect(firstRow[4].text).toBe('Jasmine Williams');
        expect(firstRow[4].value).toBe('Jasmine Williams');
        expect(firstRow[4].selected).toBe(true);
        expect(secondRow[0].text).toBe('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME');
        expect(secondRow[3].text).toBe('Mike Brown');
        expect(secondRow[3].value).toBe('Mike Brown');
        expect(secondRow[3].selected).toBe(true);
      }
    });

    it('should return empty claimant support required details with empty dropdown from draft store if non-present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
      //When
      const supportRequiredList = await getSupportRequired(claimId);
      const selectedNames = supportRequiredList?.items?.map(item => item.fullName);
      const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames, lang);
      //Then
      if (supportRequiredList.items) {
        expect(supportRequiredList.items).toBeTruthy();
        expect(supportRequiredList.items.length).toBe(1);
        expect(supportRequiredList.items[0]?.fullName).toBeUndefined();
        expect(supportRequiredList.items[0].disabledAccess).toBeUndefined();
        expect(supportRequiredList.items[0].hearingLoop).toBeUndefined();
        expect(supportRequiredList.items[0].signLanguageInterpreter).toBeUndefined();
        expect(supportRequiredList.items[0].languageInterpreter).toBeUndefined();
        expect(supportRequiredList.items[0].otherSupport).toBeUndefined();
      }
      if (peopleLists.length) {
        const firstRow = peopleLists[0] as NameListType[];
        expect(peopleLists.length).toBe(1);
        expect(firstRow[0].text).toBe('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME');
        expect(firstRow[0].value).toBe('');
        expect(firstRow[0].selected).toBe(false);
      }
    });
  });
});
