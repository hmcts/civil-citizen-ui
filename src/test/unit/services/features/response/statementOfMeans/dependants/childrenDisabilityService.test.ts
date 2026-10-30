import {YesNo} from 'form/models/yesNo';
import {
  getChildrenDisability,
  hasDisabledChildren,
  isDefendantDisabledButNotSeverely,
  isDefendantNotDisabled,
  isDefendantPartnerDisabled,
  saveChildrenDisability,
} from 'services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const noStatementOfMeansMock = require('../noStatementOfMeansMock.json');
const noStatementOfMeans: string = JSON.stringify(noStatementOfMeansMock);
const civilClaimResponseNoDefendantDisabilityOrSevereDisabilityMock = require('../civilClaimResponseNoDefendantDisabilityOrSevereDisabilityMock.json');
const noDefendantDisabilityOrSevereDisability: string = JSON.stringify(civilClaimResponseNoDefendantDisabilityOrSevereDisabilityMock);
const civilClaimResponseNoDefendantDisabilityOrSevereDisabilityOptionsMock = require('../civilClaimResponseNoDefendantDisabilityOrSevereDisabilityOptionsMock.json');
const noDefendantDisabilityOrSevereDisabilityOptions: string = JSON.stringify(civilClaimResponseNoDefendantDisabilityOrSevereDisabilityOptionsMock);
const civilClaimResponseNoPartnerMock = require('../civilClaimResponseNoPartnerMock.json');
const noPartner: string = JSON.stringify(civilClaimResponseNoPartnerMock);
const civilClaimResponseNoPartnerDisabilityMock = require('../civilClaimResponseNoPartnerDisabilityMock.json');
const noPartnerDisability: string = JSON.stringify(civilClaimResponseNoPartnerDisabilityMock);
const civilClaimResponseNoPartnerDisabilityCohabitingNoOptionMock = require('../civilClaimResponseNoPartnerDisabilityCohabitingNoOptionMock.json');
const noPartnerDisabilityCohabitingNoOption: string = JSON.stringify(civilClaimResponseNoPartnerDisabilityCohabitingNoOptionMock);
const civilClaimResponseNoCohabitingMock = require('../civilClaimResponseNoCohabitingMock.json');
const noCohabiting: string = JSON.stringify(civilClaimResponseNoCohabitingMock);
const civilClaimResponseNoCohabitingPartnerDisabilityNoOptionMock = require('../civilClaimResponseNoCohabitingPartnerDisabilityNoOptionMock.json');
const noCohabitingPartnerDisabilityNoOption: string = JSON.stringify(civilClaimResponseNoCohabitingPartnerDisabilityNoOptionMock);
const civilClaimResponseNoPartnerOrDisabilityMock = require('../civilClaimResponseNoPartnerOrDefendantSevereDisabilityMock.json');
const noPartnerOrDisability: string = JSON.stringify(civilClaimResponseNoPartnerOrDisabilityMock);

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

describe('Children Disability service', () => {
  describe('Validation', () => {
    it('should not raise any error if YES is selected', async () => {
      //Given
      const childrenDisability = new GenericYesNo(YesNo.YES);
      //When
      const form: GenericForm<GenericYesNo> = new GenericForm(childrenDisability);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    it('should not raise any error if NO is selected', async () => {
      //Given
      const childrenDisability = new GenericYesNo(YesNo.NO);
      //When
      const form: GenericForm<GenericYesNo> = new GenericForm(childrenDisability);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    it('should raise an error if nothing is selected', async () => {
      //Given
      const childrenDisability = new GenericYesNo(undefined);
      //When
      const form: GenericForm<GenericYesNo> = new GenericForm(childrenDisability);
      await form.validate();
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('option');
      expect(form.getErrors()[0].constraints).toEqual({isDefined: 'ERRORS.VALID_YES_NO_OPTION'});
    });
  });

  describe('get and save ChildrenDisability', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return empty ChildrenDisability when not set', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const childrenDisability = await getChildrenDisability(mockReq);

      expect(childrenDisability).toEqual(new GenericYesNo());
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
    });

    it('should return ChildrenDisability when data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.childrenDisability = new GenericYesNo(YesNo.YES);
      mockGetResponseClaimById.mockResolvedValue(claim);

      const childrenDisability = await getChildrenDisability(mockReq);

      expect(childrenDisability.option).toBe(YesNo.YES);
    });

    it('should throw when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getChildrenDisability(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveChildrenDisability(mockReq, new GenericYesNo(YesNo.NO)))
        .rejects.toThrow('[childrenDisabilityService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save when statement of means does not exist', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveChildrenDisability(mockReq, new GenericYesNo(YesNo.YES));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            childrenDisability: expect.objectContaining({option: YesNo.YES}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save when statement of means already exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveChildrenDisability(mockReq, new GenericYesNo(YesNo.NO));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          statementOfMeans: expect.objectContaining({
            childrenDisability: expect.objectContaining({option: YesNo.NO}),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveChildrenDisability(mockReq, new GenericYesNo(YesNo.YES)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('isCheckChildrenDisabled', () => {
    it('should return false if no statement of means', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noStatementOfMeans));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).toBe(undefined);
      expect(isDefendantNotDisabled(claim.case_data.statementOfMeans)).toBe(false);
    });
    it('should return false if no statement of means', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noStatementOfMeans));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).toBe(undefined);
      expect(isDefendantDisabledButNotSeverely(claim.case_data.statementOfMeans)).toBe(false);
    });
    it('should return false if no statement of means', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noStatementOfMeans));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).toBe(undefined);
      expect(isDefendantPartnerDisabled(claim.case_data.statementOfMeans)).toBe(false);
    });
    it('should return false if no statement of means', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noStatementOfMeans));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if no disability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noDefendantDisabilityOrSevereDisability));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability).toBe(undefined);
      expect(claim.case_data.statementOfMeans.severeDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if disability and severeDisability but no options', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noDefendantDisabilityOrSevereDisabilityOptions));
      //Given
      //Then
      expect(claim.case_data.statementOfMeans).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability.option).toBe(undefined);
      expect(claim.case_data.statementOfMeans.severeDisability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.severeDisability.option).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return true if defendant disability NO, severe disability undefined', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartnerOrDisability));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.disability.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability.option).toBe(YesNo.NO);
      expect(claim.case_data.statementOfMeans.severeDisability).toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return false if defendant disability YES, severe disability undefined', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartnerOrDisability));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.disability.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.disability.option).toBe(YesNo.YES);
      expect(claim.case_data.statementOfMeans.severeDisability).toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return true if defendant not disabled, no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartner));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      // Expect severeDisability to still be YES unless you explicitly change it
      expect(claim.case_data.statementOfMeans.severeDisability.option).toBe(YesNo.YES);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, but partner options not existing', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartner));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, partner but no partnerDisability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartner));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, partner but no partnerDisability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartnerDisability));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).toBe(YesNo.YES);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, partner NO, no partnerDisability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartnerDisability));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).toBe(YesNo.NO);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, partner but no partnerDisability', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noPartnerDisabilityCohabitingNoOption));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.cohabiting).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, partnerDisability NO, no cohabiting', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noCohabiting));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.partnerDisability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability.option).toBe(YesNo.NO);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, partnerDisability but no cohabiting', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noCohabiting));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.partnerDisability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability.option).toBe(YesNo.YES);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, no cohabiting, partnerDisability but no option', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(noCohabitingPartnerDisabilityNoOption));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(claim.case_data.statementOfMeans.partnerDisability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability.option).toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting).toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(2, undefined, 2);
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(claim.case_data.statementOfMeans.severeDisability.option).not.toBe(undefined);
      expect(numberOfChildren.totalNumberOfChildren()).toBe(4);
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return false if no children, even if defendant not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren.under11 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between11and15 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between16and19 = 0;
      claim.case_data.statementOfMeans.disability.option = YesNo.NO;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if no children, even if defendant not severely disabled and no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren.under11 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between11and15 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between16and19 = 0;
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
      expect(claim.case_data.statementOfMeans.cohabiting).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.cohabiting.option).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability).not.toBe(undefined);
      expect(claim.case_data.statementOfMeans.partnerDisability.option).not.toBe(undefined);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if no children, even if defendant not severely disabled and partner not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      //Given
      claim.case_data.statementOfMeans.dependants.numberOfChildren.under11 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between11and15 = 0;
      claim.case_data.statementOfMeans.dependants.numberOfChildren.between16and19 = 0;
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.dependants.numberOfChildren = numberOfChildren;
      //Then
      expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return true if defendant disabled, not severely, and partner not disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, and no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, and no partner, even if disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return true if defendant disabled, not severely, and no partner, even if both disabled flags set', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.YES;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(true);
    });
    it('should return false if defendant disabled, not severely, and partner disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if defendant disabled, not severely, and partner severely disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.YES;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if defendant severely disabled, even if no partner', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if defendant severely disabled, even if partner not', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.NO;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if defendant severely disabled, and partner disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.NO;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
    it('should return false if defendant severely disabled, and partner severely disabled', async () => {
      //When
      const claim = Object.assign(new CivilClaimResponse(), JSON.parse(civilClaimResponse));
      //Given
      claim.case_data.statementOfMeans.disability.option = YesNo.YES;
      claim.case_data.statementOfMeans.severeDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.cohabiting.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerDisability.option = YesNo.YES;
      claim.case_data.statementOfMeans.partnerSevereDisability.option = YesNo.YES;
      //Then
      expect(hasDisabledChildren(claim.case_data)).toBe(false);
    });
  });
});
