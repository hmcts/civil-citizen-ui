import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {
  constructBanksAndSavingsAccountSection,
  constructChildrenSection,
  constructCourtOrdersSection,
  constructDebtsSection,
  constructEmploymentDetailsSection,
  constructFinancialSupportSection,
  constructMonthlyExpensesSection,
  constructMonthlyIncomeSection,
  constructRepaymentPlanSection,
  constructSelfEmploymentDetailsSection,
  getClaimantResponse, getFinancialDetails,
  saveClaimantResponse,
} from '../../../../../main/services/features/claimantResponse/claimantResponseService';
import {ClaimantResponse} from '../../../../../main/common/models/claimantResponse';
import {getLng} from '../../../../../main/common/utils/languageToggleUtils';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import {ResidenceType} from '../../../../../main/common/form/models/statementOfMeans/residence/residenceType';
import {Residence} from '../../../../../main/common/form/models/statementOfMeans/residence/residence';
import {NumberOfChildren} from '../../../../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';
import {Dependants} from '../../../../../main/common/form/models/statementOfMeans/dependants/dependants';
import {EmploymentCategory} from '../../../../../main/common/form/models/statementOfMeans/employment/employmentCategory';
import {RegularIncome} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {Transaction} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {RegularExpenses} from '../../../../../main/common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {CourtOrder} from '../../../../../main/common/form/models/statementOfMeans/courtOrders/courtOrder';
import {PriorityDebts} from '../../../../../main/common/form/models/statementOfMeans/priorityDebts';
import {Debts} from '../../../../../main/common/form/models/statementOfMeans/debts/debts';
import {DebtItems} from '../../../../../main/common/form/models/statementOfMeans/debts/debtItems';
import {CCJRequest} from '../../../../../main/common/models/claimantResponse/ccj/ccjRequest';
import {CitizenDate} from 'common/form/models/claim/claimant/citizenDate';
import {RejectionReason} from '../../../../../main/common/form/models/claimantResponse/rejectionReason';
import {PaymentOptionType} from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {TransactionSource} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {ResponseType} from 'common/form/models/responseType';
import {Party} from 'common/models/party';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getFinalPaymentDate} from 'common/utils/repaymentUtils';
import {t} from 'i18next';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Mediation} from 'models/mediation/mediation';
import {CourtProposedDate, CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {SignSettlmentAgreement} from 'form/models/claimantResponse/signSettlementAgreement';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/common/utils/languageToggleUtils');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const languageMock = getLng as jest.Mock;
const REDIS_FAILURE = 'Redis DraftStore failure.';

describe('Claimant Response Service', () => {
  describe('getClaimantResponse', () => {
    it('should return undefined if direction claimant response is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const claimantResponse = await getClaimantResponse('validClaimId');
      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Response object with hasDefendantPaidYou no', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.NO);
    });

    it('should return Claimant Response object with hasDefendantPaidYou yes', async () => {
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasDefendantPaidYou = {
        option: YesNo.YES,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantResponse = await getClaimantResponse('validClaimId');

      expect(claimantResponse?.hasDefendantPaidYou.option).toBe(YesNo.YES);
    });

    describe('intentionToProceed', () => {
      it('should return undefined if intention to proceed is not set', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed).toBeUndefined();
      });

      it('should return Claimant Response object', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        expect(claimantResponse).toBeDefined();
        //Then
        expect(claimantResponse?.intentionToProceed).toBeUndefined();
      });

      it('should return Claimant Response object with intentionToProceed no', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.intentionToProceed = {
          option: YesNo.NO,
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed.option).toBe(YesNo.NO);
      });

      it('should return Claimant Response object with intentionToProceed yes', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.intentionToProceed = {
          option: YesNo.YES,
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.intentionToProceed.option).toBe(YesNo.YES);
      });
    });

    describe('CCJ-Defendant date of birth', () => {
      it('should return undefined if defendant dob is not set', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest?.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest?.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object with ccj request', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest).toBeDefined();
        expect(claimantResponse.ccjRequest.defendantDOB).toBeUndefined();
      });

      it('should return Claimant Response object with "no" option', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.defendantDOB = {option: YesNo.NO};
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.defendantDOB.option).toBe(YesNo.NO);
        expect(claimantResponse?.ccjRequest.defendantDOB.dob).toBeUndefined();
      });

      it('should return Claimant Response object with dob details with option yes', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.defendantDOB = {
          option: YesNo.NO,
          dob: {dateOfBirth: new Date('2000-11-11T00:00:00.000Z')},
        };
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.defendantDOB.option).toBe(YesNo.NO);
        expect(claimantResponse?.ccjRequest.defendantDOB.dob.dateOfBirth.toDateString()).toBe('Sat Nov 11 2000');
      });
    });

    describe('CCJ-Payment option get', () => {
      it('should return undefined if ccj payment option is not set', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest?.ccjPaymentOption).toBeUndefined();
      });

      it('should return Claimant Response object', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest?.ccjPaymentOption).toBeUndefined();
      });

      it('should return Claimant Response object with ccj request', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse).toBeDefined();
        expect(claimantResponse.ccjRequest).toBeDefined();
        expect(claimantResponse.ccjRequest.ccjPaymentOption).toBeUndefined();
      });

      it('should return Claimant Response object with option IMMEDIATELY', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.IMMEDIATELY);
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.ccjPaymentOption.type).toBe(PaymentOptionType.IMMEDIATELY);
      });

      it('should return Claimant Response object with option INSTALMENTS', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.INSTALMENTS);
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.ccjPaymentOption.type).toBe(PaymentOptionType.INSTALMENTS);
      });

      it('should return Claimant Response object with option BY_SET_DATE', async () => {
        //Given
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.ccjRequest = new CCJRequest();
        claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.BY_SET_DATE);
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          return claim;
        });
        //When
        const claimantResponse = await getClaimantResponse('validClaimId');
        //Then
        expect(claimantResponse?.ccjRequest.ccjPaymentOption.type).toBe(PaymentOptionType.BY_SET_DATE);
      });
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });

      await expect(getClaimantResponse('claimId')).rejects.toThrow(REDIS_FAILURE);
    });
  });

  describe('saveClaimantResponse', () => {
    const claimantResponse = new ClaimantResponse();
    claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);

    it('should save claimant response successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claimantResponseToSave = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      await saveClaimantResponse('validClaimId', YesNo.NO, 'option', 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToSave }, true);
    });

    it('should update claim determination successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = claimantResponse;
        return claim;
      });
      const claimantResponseToUpdate = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveClaimantResponse('validClaimId', claimantResponse?.hasDefendantPaidYou.option, 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
    });

    it('should update payment option successfully from payment by date', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.suggestedPaymentIntention = {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate : new Date() } ;
        return claim;
      });
      const claimantResponseToUpdate = {
        suggestedPaymentIntention: {paymentOption: PaymentOptionType.IMMEDIATELY},
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', PaymentOptionType.IMMEDIATELY, 'paymentOption', 'suggestedPaymentIntention');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
    });

    it('should update payment option successfully from pay by instalments', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.suggestedPaymentIntention = {
          paymentOption: PaymentOptionType.INSTALMENTS,
          repaymentPlan: { paymentAmount: 100},
        };
        return claim;
      });
      const claimantResponseToUpdate = {
        suggestedPaymentIntention: {paymentOption: PaymentOptionType.IMMEDIATELY},
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', PaymentOptionType.IMMEDIATELY, 'paymentOption', 'suggestedPaymentIntention');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
    });
    it('should delete hasPartPaymentBeenAccepted and rejectionReason fields from redis when hasDefendantPaidYou is no', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.NO);
        claim.claimantResponse.rejectionReason = {text: 'test'};
        return claim;
      });
      const claimantResponseToUpdate =
      {
        hasDefendantPaidYou: new GenericYesNo(YesNo.NO),
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', new GenericYesNo(YesNo.NO), 'hasDefendantPaidYou');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
    });
    it('should delete rejectionReason field from redis when hasPartPaymentBeenAccepted is yes', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.rejectionReason = {text: 'test'};
        return claim;
      });
      const claimantResponseToUpdate =
      {
        hasPartPaymentBeenAccepted: new GenericYesNo(YesNo.YES),
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', new GenericYesNo(YesNo.YES) , 'hasPartPaymentBeenAccepted');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
    });
    it('should delete rejectionReason field from redis when hasFullDefenceStatesPaidClaimSettled is yes', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.rejectionReason = { text: 'test' };
        return claim;
      });
      const claimantResponseToUpdate =
      {
        hasFullDefenceStatesPaidClaimSettled: new GenericYesNo(YesNo.YES),
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', new GenericYesNo(YesNo.YES), 'hasFullDefenceStatesPaidClaimSettled');
      //Then
      expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
    });
    it('should delete data from redis when hasPartAdmittedBeenAccepted property submitted', async () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.NO);
      claim.claimantResponse.mediation =  new Mediation();
      claim.claimantResponse.mediation.mediationDisagreement = new GenericYesNo(YesNo.YES);
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();

      mockGetCaseDataFromDraftStore.mockResolvedValueOnce(claim);
      jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', new GenericYesNo(YesNo.YES) , 'hasPartAdmittedBeenAccepted');
      //Then
      expect(claim.claimantResponse.hasPartPaymentBeenAccepted).toBeUndefined();
      expect(claim.claimantResponse.mediation.mediationDisagreement).toBeUndefined();
      expect(claim.claimantResponse.directionQuestionnaire).toBeUndefined();
    });
    it('should delete data from redis when fullAdmitSetDateAcceptPayment property submitted', async () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
      claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      claim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date();
      claim.claimantResponse.courtProposedDate = new CourtProposedDate();
      claim.claimantResponse.courtProposedDate.decision = CourtProposedDateOptions.JUDGE_REPAYMENT_DATE;
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
      claim.claimantResponse.signSettlementAgreement = <SignSettlmentAgreement>{ signed: 'true', };
      claim.claimantResponse.ccjRequest = new CCJRequest();
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
      mockGetCaseDataFromDraftStore.mockResolvedValueOnce(claim);
      jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', new GenericYesNo(YesNo.YES) , 'fullAdmitSetDateAcceptPayment');
      //Then
      expect(claim.claimantResponse.suggestedPaymentIntention).toBeUndefined();
      expect(claim.claimantResponse.courtProposedDate.decision).toBeUndefined();
      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest.paidAmount.option).toBeUndefined();
    });
    it('should delete data from redis when propose alternative repayment plan submitted', async () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
      claim.claimantResponse.signSettlementAgreement = <SignSettlmentAgreement>{ signed: 'true', };
      claim.claimantResponse.ccjRequest = new CCJRequest();
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
      mockGetCaseDataFromDraftStore.mockResolvedValueOnce(claim);
      jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', 'IMMEDIATELY' , 'paymentOption','suggestedPaymentIntention');
      //Then
      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest.paidAmount.option).toBeUndefined();
    });
    it('should delete data from redis when courtProposedDate with decision submitted', async () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.REQUEST_A_CCJ);
      claim.claimantResponse.signSettlementAgreement = <SignSettlmentAgreement>{signed: 'true',};
      claim.claimantResponse.ccjRequest = new CCJRequest();
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
      mockGetCaseDataFromDraftStore.mockResolvedValueOnce(claim);
      jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', 'JUDGE_REPAYMENT_DATE' , 'decision','courtProposedDate');
      //Then
      expect(claim.claimantResponse.chooseHowToProceed).toBeUndefined();
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest.paidAmount.option).toBeUndefined();
    });
    it('should delete data from redis when chooseHowToProceed option submitted', async () => {
      //Given
      const claim = new Claim();
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.signSettlementAgreement = <SignSettlmentAgreement>{ signed: 'true', };
      claim.claimantResponse.ccjRequest = new CCJRequest();
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
      mockGetCaseDataFromDraftStore.mockResolvedValueOnce(claim);
      jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantResponse('validClaimId', 'REQUEST_A_CCJ' , 'option','chooseHowToProceed');
      //Then
      expect(claim.claimantResponse.signSettlementAgreement).toBeUndefined();
      expect(claim.claimantResponse.ccjRequest.paidAmount.option).toBeUndefined();
    });
    describe('intentionToProceed', () => {
      claimantResponse.intentionToProceed = new GenericYesNo(YesNo.YES);
      it('should save claimant response successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = new ClaimantResponse();
          return claim;
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        const claimantResponseToSave = {
          intentionToProceed: {option: YesNo.NO},
        };
        //When
        await saveClaimantResponse('validClaimId', YesNo.NO, 'option', 'intentionToProceed');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToSave }, true);
      });

      it('should update claim intentionToProceed successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = claimantResponse;
          return claim;
        });
        const claimantResponseToUpdate = {
          intentionToProceed: {option: YesNo.NO},
        };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimantResponse('validClaimId', claimantResponse?.intentionToProceed.option, 'intentionToProceed');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
      });
    });

    describe('CCJ-Defendant date of birth', () => {

      it('should save claimant response successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = new ClaimantResponse();
          return claim;
        });
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        const claimantResponseToSave = {
          ccjRequest: {defendantDOB: 'no'},
        };
        //When
        await saveClaimantResponse('validClaimId', YesNo.NO, 'defendantDOB', 'ccjRequest');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToSave }, true);
      });

      it('should update claim defendant dob successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          const date = new Date();
          claim.claimantResponse = <ClaimantResponse>{ ccjRequest: new CCJRequest(), datePaid: new CitizenDate(date.getFullYear().toString(),(date.getMonth()-1).toString(),date.getDate().toString())};
          claim.claimantResponse.ccjRequest.defendantDOB = { option : YesNo.YES };
          return claim;
        });
        const claimantResponseToUpdate = {
          ccjRequest: {defendantDOB: 'no'},
        };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimantResponse('validClaimId', YesNo.NO, 'defendantDOB', 'ccjRequest');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
      });

      it('should save rejection response successfully', async () => {
        //Given
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimantResponse('claimId', new RejectionReason('not agree'), 'rejectionReason');
        //Then
        expect(spySave).toBeCalled();
      });
    });

    describe('CCJ-Payment option save', () => {

      it('should save claimant response successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = new ClaimantResponse();
          return claim;
        });
        const ccjPaymentOption = {
          type: PaymentOptionType.IMMEDIATELY,
        };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        const claimantResponseToSave = {
          ccjRequest: {
            ccjPaymentOption: {
              type: PaymentOptionType.IMMEDIATELY,
            }},
        };
        //When
        await saveClaimantResponse('validClaimId', ccjPaymentOption, 'ccjPaymentOption', 'ccjRequest');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToSave }, true);
      });

      it('should update claim defendant dob successfully', async () => {
        //Given
        mockGetCaseDataFromDraftStore.mockImplementation(async () => {
          const claim = new Claim();
          claim.claimantResponse = new ClaimantResponse();
          claim.claimantResponse.ccjRequest = new CCJRequest();
          claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.BY_SET_DATE);
          return claim;
        });
        const ccjPaymentOptionUpdate = {
          type: PaymentOptionType.BY_SET_DATE,
        };
        const claimantResponseToUpdate =
          {
            ccjRequest: {
              ccjPaymentOption: {
                type: PaymentOptionType.BY_SET_DATE,
              }},
          };
        const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
        //When
        await saveClaimantResponse('validClaimId', ccjPaymentOptionUpdate, 'ccjPaymentOption', 'ccjRequest');
        //Then
        expect(spySave).toHaveBeenCalledWith('validClaimId', { claimantResponse: claimantResponseToUpdate }, true);
      });
    });

    it('should return an error on redis failure', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      //Then
      await expect(saveClaimantResponse('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(REDIS_FAILURE);
    });

    describe('get rejection reason form model', () => {
      it('should return an empty form model when no data retrieved', async () => {
        //Given
        const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
        const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

        mockGetCaseData.mockImplementation(async () => {
          return new Claim();
        });
        //When
        const result = await getClaimantResponse('claimId');
        //Then
        expect(spyGetCaseDataFromStore).toBeCalled();
        expect(result).toEqual(new RejectionReason());
      });
      it('should return populated form model when data exists', async () => {
        //Given
        const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
        const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
        const newClaim = new Claim();
        const response = new ClaimantResponse();
        const reason = new RejectionReason('not agree');
        response.rejectionReason = reason;
        newClaim.claimantResponse = response;

        mockGetCaseData.mockImplementation(async () => {
          return newClaim;
        });
        //When
        const claimantResponse = await getClaimantResponse('claimId');
        //Then
        expect(spyGetCaseDataFromStore).toBeCalled();
        expect(claimantResponse).not.toBeNull();
        expect(claimantResponse?.rejectionReason.text).toBe('not agree');
      });
    });
  });
});

describe('Summary section', () => {
  const noBorderClass = 'govuk-summary-list__row--no-border';
  const emptyObject = {text: ''};
  const claim = new Claim();
  claim.statementOfMeans = new StatementOfMeans();

  beforeAll(() => {
    languageMock.mockImplementation(() => 'cimode');
  });

  describe('constructBanksAndSavingsAccountSection', () => {
    it('should return empty values if statement of means does not have bank and savings account data', () => {
      const response = constructBanksAndSavingsAccountSection(new Claim(), 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.ACCOUNT_TYPE',
          },
          value: emptyObject,
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.BALANCE',
          },
          value: emptyObject,
        },
        {
          key: {
            text: 'COMMON.BANK_JOINT_ACCOUNT',
          },
          value: emptyObject,
        },
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHERE_THEY_LIVE',
          },
          value: {
            text: undefined,
          },
        },
      ];
      expect(response).toStrictEqual(expectedData);
    });

    it ('should return rows with set data if bank accounts are provided', () => {
      claim.statementOfMeans.residence = new Residence(ResidenceType.OTHER);
      claim.statementOfMeans.bankAccounts = [
        {
          typeOfAccount: 'CURRENT_ACCOUNT',
          joint: 'yes',
          balance: '80',
        },
        {
          typeOfAccount: '',
          joint: 'no',
          balance: '20',
        },
      ];
      const response = constructBanksAndSavingsAccountSection(claim, 'cimode');

      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.ACCOUNT_TYPE',
          },
          value: {
            text: 'PAGES.CITIZEN_BANK_ACCOUNTS.CURRENT_ACCOUNT',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.BALANCE',
          },
          value: {
            text: '£80',
          },
        },
        {
          key: {
            text: 'COMMON.BANK_JOINT_ACCOUNT',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.ACCOUNT_TYPE',
          },
          value: emptyObject,
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.BALANCE',
          },
          value: {
            text: '£20',
          },
        },
        {
          key: {
            text: 'COMMON.BANK_JOINT_ACCOUNT',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.WHERE_THEY_LIVE',
          },
          value: {
            text: 'OTHER',
          },
        },
      ];
      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructChildrenSection', () => {
    it('should return dependant selection as no if there are no dependants living with defendant', () => {
      const response = constructChildrenSection(new Claim(), 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.CHILDREN_LIVING_WITH_THEM',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });

    it('should return rows with data if there are dependants provided', () => {
      claim.statementOfMeans.dependants = new Dependants(true, new NumberOfChildren(1, 0, 2));
      claim.statementOfMeans.numberOfChildrenLivingWithYou = 1;
      const response = constructChildrenSection(claim, 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.CHILDREN_LIVING_WITH_THEM',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_UNDER_11',
          },
          value: {
            text: 1,
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_11_TO_15',
          },
          value: {
            text: 0,
          },
        },
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_16_TO_19',
          },
          value: {
            text: 2,
          },
        },
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.AGED_16_TO_19_AND_EDUCATION',
          },
          value: {
            text: 1,
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructFinancialSupportSection', () => {
    it('should return other dependants selection as no if there are no other dependants living with defendant', () => {
      const response = constructFinancialSupportSection(new Claim(), 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.SUPPORT_ANYONE_ELSE',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });

    it('should display other dependants if data is provided', () => {
      claim.statementOfMeans.otherDependants = {
        option: YesNo.YES,
        numberOfPeople: 3,
        details: 'Number of people details',
      };
      const response = constructFinancialSupportSection(claim, 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.SUPPORT_ANYONE_ELSE',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.NUMBER_OF_PEOPLE',
          },
          value: {
            text: claim.statementOfMeans.otherDependants.numberOfPeople,
          },
        },
        {
          key: {
            text: 'COMMON.GIVE_DETAILS',
          },
          value: {
            text: claim.statementOfMeans.otherDependants.details,
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructEmploymentDetailsSection', () => {
    it('should return no selection if employment details are not provided', () => {
      const response = constructEmploymentDetailsSection(new Claim(), 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.EMPLOYED',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });

    it('should return employment details rows if details are provided', () => {
      claim.statementOfMeans.employment = {
        declared: true,
        employmentType: [EmploymentCategory.EMPLOYED, EmploymentCategory.SELF_EMPLOYED],
      };
      claim.statementOfMeans.employers = {
        rows: [
          {
            employerName: 'Bobs Burger',
            jobTitle: 'Master flipper',
          },
          {
            employerName: 'Avengers',
            jobTitle: 'Part Time Superhero',
          },
        ],
      };
      const response = constructEmploymentDetailsSection(claim, 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.EMPLOYED',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          key: {
            text: 'COMMON.EMPLOYMENT_TYPE',
          },
          value: {
            text: 'PAGES.EMPLOYMENT_STATUS.EMPLOYED',
          },
        },
        {
          key: {
            text: 'COMMON.EMPLOYMENT_TYPE',
          },
          value: {
            text: 'PAGES.EMPLOYMENT_STATUS.SELF_EMPLOYED',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.EMPLOYER_NAME',
          },
          value: {
            text: claim.statementOfMeans.employers.rows[0].employerName,
          },
        },
        {
          key: {
            text: 'COMMON.JOB_TITLE',
          },
          value: {
            text: claim.statementOfMeans.employers.rows[0].jobTitle,
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.EMPLOYER_NAME',
          },
          value: {
            text: claim.statementOfMeans.employers.rows[1].employerName,
          },
        },
        {
          key: {
            text: 'COMMON.JOB_TITLE',
          },
          value: {
            text: claim.statementOfMeans.employers.rows[1].jobTitle,
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructSelfEmploymentDetailsSection', () => {
    it('should return empty list if self-employment details are not provided', () => {
      const response = constructSelfEmploymentDetailsSection(new Claim(), 'cimode');
      expect(response).toStrictEqual([]);
    });

    it('should return list with data if sel-employment details are provided', () => {
      claim.statementOfMeans.selfEmployedAs = {
        jobTitle: 'Venture Capitalist',
        annualTurnover: 200,
      };
      claim.statementOfMeans.taxPayments = {
        owed: true,
        amountOwed: 800,
        reason: 'Bad investment',
      };

      const response = constructSelfEmploymentDetailsSection(claim, 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.JOB_TITLE',
          },
          value: {
            text: claim.statementOfMeans.selfEmployedAs.jobTitle,
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.ANNUAL_TURNOVER',
          },
          value: {
            text: '£200',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.BEHIND_ON_TAX_PAYMENTS',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.AMOUNT_OWED',
          },
          value: {
            text: '£800',
          },
        },
        {
          key: {
            text: 'COMMON.REASON',
          },
          value: {
            text: claim.statementOfMeans.taxPayments.reason,
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructMonthlyIncomeSection', () => {
    it('should display no option if data is not provided', () => {
      const response = constructMonthlyIncomeSection(new Claim(), 'cimode');
      const expectedData = [
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.RECEIVE_INCOME',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });

    it('should display rows data if data is provided', () => {
      claim.statementOfMeans.regularIncome = new RegularIncome({job: new Transaction()});
      const response = constructMonthlyIncomeSection(claim, 'cimode');
      const expectedData = [
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.RECEIVE_INCOME',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructMonthlyExpensesSection', () => {
    it('should display no option if data is not provided', () => {
      const response = constructMonthlyExpensesSection(new Claim(), 'cimode');
      const expectedData = [
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PAY_EXPENSES',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });

    it('should display rows data if data is provided', () => {
      claim.statementOfMeans.regularExpenses = new RegularExpenses({mortgage: new Transaction()});
      const response = constructMonthlyExpensesSection(claim, 'cimode');
      const expectedData = [
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PAY_EXPENSES',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructCourtOrdersSection', () => {
    it('should display no option if data is not provided', () => {
      const response = constructCourtOrdersSection(new Claim(), 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.COURT_ORDERS_TO_PAY',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });

    it('should display rows data if data is provided', () => {
      claim.statementOfMeans.courtOrders = {
        declared: true,
        rows: [
          new CourtOrder(99, 9, '000CLAIM123'),
        ],
      };
      const response = constructCourtOrdersSection(claim, 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.COURT_ORDERS_TO_PAY',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.CLAIM_NUMBER',
          },
          value: {
            text: claim.statementOfMeans.courtOrders.rows[0].claimNumber,
          },
        },
        {
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.AMOUNT_OWED',
          },
          value: {
            text: '£99',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });
  });

  describe('constructDebtsSection', () => {
    it('should display no options if data is not provided', () => {
      const response = constructDebtsSection(new Claim(), 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.DEBTS_BEHIND_ON',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.DEBTS_LOAN_OR_CREDIT_CARD',
          },
          value: {
            text: 'COMMON.NO',
          },
        },
      ];

      expect(response).toStrictEqual(expectedData);
    });

    it('should display rows data if data is provided', () => {
      claim.statementOfMeans.priorityDebts = new PriorityDebts({
        mortgage: new Transaction(true, new TransactionSource({
          name: 'Mortgage',
          amount: 8,
          schedule: TransactionSchedule.WEEK,
          isIncome: false,
        })),
        rent: new Transaction(true, new TransactionSource({
          name: 'Rent',
          amount: 88,
          schedule: TransactionSchedule.MONTH,
          isIncome: false,
        })),
      });
      claim.statementOfMeans.debts = new Debts('yes', [
        new DebtItems('Bad investment', '888', '22'),
        new DebtItems('Fish insurance', '75', '2'),
      ]);
      const response = constructDebtsSection(claim, 'cimode');
      const expectedData = [
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.DEBTS_BEHIND_ON',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.DEBT',
          },
          value: {
            text: 'COMMON.CHECKBOX_FIELDS.MORTGAGE',
          },
        },
        {
          key: {
            text: 'COMMON.PAYMENT_SCHEDULE.WEEKLY',
          },
          value: {
            text: '£8',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.DEBTS_LOAN_OR_CREDIT_CARD',
          },
          value: {
            text: 'COMMON.YES',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.DEBT',
          },
          value: {
            text: claim.statementOfMeans.debts.debtsItems[0].debt,
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.TOTAL_DEBT',
          },
          value: {
            text: '£888',
          },
        },
        {
          key: {
            text: 'COMMON.MONTHLY_PAYMENTS',
          },
          value: {
            text: '£22',
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.DEBT',
          },
          value: {
            text: claim.statementOfMeans.debts.debtsItems[1].debt,
          },
        },
        {
          classes: noBorderClass,
          key: {
            text: 'COMMON.TOTAL_DEBT',
          },
          value: {
            text: '£75',
          },
        },
        {
          key: {
            text: 'COMMON.MONTHLY_PAYMENTS',
          },
          value: {
            text: '£2',
          },
        },
      ];

      for (let i = 0; i < expectedData.length; i++) {
        expect(response).toContainEqual(expectedData[i]);
      }
    });
  });

  describe('getFinancialDetails', () => {
    it('should call all construct sections', () => {
      const financialDetails = getFinancialDetails(claim, 'cimode');
      expect(financialDetails.length).toBe(9);
    });
  });

  describe('constructRepaymentPlanSection', () => {

    const getExpectedData = (frequency:string,planLength:string) => {
      return  [
        {
          classes: 'govuk-summary-list__row--no-border',
          key: {
            text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.REGULAR_PAYMENTS'),
          },
          value: {
            text: '£50',
          },
        },
        {
          classes: 'govuk-summary-list__row--no-border',
          key: {
            text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.FREQUENCY_OF_PAYMENTS'),
          },
          value: {
            text: frequency,
          },
        },
        {
          classes: 'govuk-summary-list__row--no-border',
          key: {
            text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.FIRST_PAYMENT_DATE'),
          },
          value: {
            text: formatDateToFullDate(new Date(Date.now())),
          },
        },
        {
          classes: 'govuk-summary-list__row--no-border',
          key: {
            text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.FINAL_PAYMENT_DATE'),
          },
          value: {
            text: formatDateToFullDate(getFinalPaymentDate(claim)),
          },
        },
        {
          classes: 'govuk-summary-list__row--no-border',
          key: {
            text: t('PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_HOW_THEY_WANT_TO_PAY_RESPONSE.REPAYMENT_PLAN.LENGTH'),
          },
          value: {
            text: planLength,
          },
        },
      ];
    };

    beforeAll(() => {
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.alreadyPaid = {
        option: YesNo.NO,
      };
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      claim.partialAdmission.howMuchDoYouOwe.amount = 200;
      claim.partialAdmission.howMuchDoYouOwe.totalAmount = 1000;
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.WEEK,
        firstRepaymentDate: new Date(Date.now()),
      };
    });
    it('should call all construct sections when transaction schedule is set to WEEK', () => {
      const response = constructRepaymentPlanSection(claim, 'cimode');
      const expectedData = getExpectedData('COMMON.FREQUENCY_OF_PAYMENTS.WEEKLY','4 COMMON.SCHEDULE.WEEKS_LOWER_CASE');
      for (let i = 0; i < expectedData.length; i++) {
        expect(response).toContainEqual(expectedData[i]);
      }
    });

    it('should call all construct sections when transaction schedule is set to TWO_WEEKS', () => {
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.TWO_WEEKS,
        firstRepaymentDate: new Date(Date.now()),
      };
      const response = constructRepaymentPlanSection(claim, 'cimode');
      const expectedData = getExpectedData('COMMON.FREQUENCY_OF_PAYMENTS.TWO_WEEKS','8 COMMON.SCHEDULE.WEEKS_LOWER_CASE');
      for (let i = 0; i < expectedData.length; i++) {
        expect(response).toContainEqual(expectedData[i]);
      }
    });

    it('should call all construct sections when transaction schedule is set to MONTH', () => {
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: TransactionSchedule.MONTH,
        firstRepaymentDate: new Date(Date.now()),
      };
      const response = constructRepaymentPlanSection(claim, 'cimode');
      const expectedData = getExpectedData('COMMON.FREQUENCY_OF_PAYMENTS.MONTHLY','4 COMMON.SCHEDULE.MONTHS_LOWER_CASE');
      for (let i = 0; i < expectedData.length; i++) {
        expect(response).toContainEqual(expectedData[i]);
      }
    });
  });
});
