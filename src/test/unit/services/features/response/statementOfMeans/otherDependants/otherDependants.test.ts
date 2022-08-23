import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../../main/common/models/claim';
import {
  OtherDependantsService,
} from '../../../../../../../main/services/features/response/statementOfMeans/otherDependants/otherDependantsService';
import {OtherDependants} from '../../../../../../../main/common/form/models/statementOfMeans/otherDependants';
import {GenericForm} from '../../../../../../../main/common/form/models/genericForm';
import {StatementOfMeans} from '../../../../../../../main/common/models/statementOfMeans';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const otherDependantsService = new OtherDependantsService();

describe('Other dependants service', () => {
  describe('saveOtherDependants', () => {
    it('should save other dependants if object is not set', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const dependants = new GenericForm<OtherDependants>({option: 'yes', numberOfPeople: 2, details: 'description'});

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await otherDependantsService.saveOtherDependants('validClaim', dependants);
      expect(spySave).toBeCalled();
    });

    it('should save other dependants if object is already set and new option is no', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.otherDependants = {
        option: YesNo.YES,
        numberOfPeople: 4,
        details: 'my details',
      };

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const dependants = new GenericForm<OtherDependants>({option: YesNo.NO, numberOfPeople: 2, details: 'description'});
      const updatedClaim = Object.assign(claim);
      updatedClaim.statementOfMeans.otherDependants = new GenericForm(new OtherDependants(YesNo.NO)).model;

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await otherDependantsService.saveOtherDependants('validClaimId', dependants);
      expect(spySave).toBeCalledWith('validClaimId', updatedClaim);
    });

    it('should save other dependants if object is already set and new option is yes', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.otherDependants = {
        option: YesNo.NO,
      };

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const dependants = new GenericForm<OtherDependants>({option: YesNo.YES, numberOfPeople: 2, details: 'description'});
      const updatedClaim = Object.assign(claim);
      updatedClaim.statementOfMeans.otherDependants = dependants.model;

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await otherDependantsService.saveOtherDependants('validClaimId', dependants);
      expect(spySave).toBeCalledWith('validClaimId', updatedClaim);
    });
  });
});
