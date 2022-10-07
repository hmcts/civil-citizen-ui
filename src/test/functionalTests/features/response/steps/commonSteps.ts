import I = CodeceptJS.I
import { ResponseSteps } from './prepareYourResponseSteps';

const I: I = actor();
const responseSteps: ResponseSteps = new ResponseSteps();

export class CommonSteps {
  EnterPersonalDetails(claimRef: string): void {
    responseSteps.VerifyResponsePageContent(claimRef);
    responseSteps.EnterNameAndAddressDetails(claimRef);
    responseSteps.EnterDateOfBirth(claimRef);
    responseSteps.EnterContactNumber(claimRef);
  }
  EnterFinancialDetails(claimRef: string): void{
    responseSteps.ShareYourFinancialDetailsIntro(claimRef);
    responseSteps.EnterBankAccountDetails();
    responseSteps.SelectDisabilityDetails('yes', 'yes');
    responseSteps.SelectResidenceDetails('ownHome');
    responseSteps.SelectPartnerDetails('yes');
    responseSteps.SelectPartnerAge('yes');
    responseSteps.SelectPartnerPension('yes');
    responseSteps.SelectPartnerDisability('no');
    responseSteps.SelectDependantDetails('yes');
    responseSteps.SelectOtherDependantDetails('yes');
    responseSteps.SelectEmploymentDetails('yes');
    responseSteps.EnterEmployerDetails();
    responseSteps.EnterSelfEmploymentDetails();
    responseSteps.EnterSelfEmploymentTaxDetails();
    responseSteps.EnterCourtOrderDetails(claimRef);
    responseSteps.PriorityDebtsDetails('120','20','10', '5');
    responseSteps.EnterDebtDetails();
    responseSteps.MonthlyExpensesDetails('1200','45', '25', '30', '100', '125');
    responseSteps.MonthlyIncomeDetails('4500', '120', '1100');
    responseSteps.EnterExplanation();
  }
}
