//import { ResponseSteps } from './prepareYourResponseSteps';

const ResponseSteps  =  require('./prepareYourResponseSteps');

//const I = actor();
//const ResponseSteps = new ResponseSteps();

class CommonSteps {

  EnterPersonalDetails(claimRef) {
    ResponseSteps.VerifyResponsePageContent(claimRef);
    ResponseSteps.EnterNameAndAddressDetails(claimRef);
    ResponseSteps.EnterDateOfBirth(claimRef);
    ResponseSteps.EnterContactNumber(claimRef);
  }

  EnterYourOptionsForDeadline(claimRef, deadlineOption){
    ResponseSteps.EnterYourOptions(claimRef, deadlineOption);
  }

  EnterFinancialDetails(claimRef) {
    ResponseSteps.ShareYourFinancialDetailsIntro(claimRef);
    ResponseSteps.EnterBankAccountDetails();
    ResponseSteps.SelectDisabilityDetails('yes', 'yes');
    ResponseSteps.SelectResidenceDetails('ownHome');
    ResponseSteps.SelectPartnerDetails('yes');
    ResponseSteps.SelectPartnerAge('yes');
    ResponseSteps.SelectPartnerPension('yes');
    ResponseSteps.SelectPartnerDisability('no');
    ResponseSteps.SelectDependantDetails('yes');
    ResponseSteps.SelectOtherDependantDetails('yes');
    ResponseSteps.SelectEmploymentDetails('yes');
    ResponseSteps.EnterEmployerDetails();
    ResponseSteps.EnterSelfEmploymentDetails();
    ResponseSteps.EnterSelfEmploymentTaxDetails();
    ResponseSteps.EnterCourtOrderDetails(claimRef);
    ResponseSteps.PriorityDebtsDetails('120','20','10', '5');
    ResponseSteps.EnterDebtDetails();
    ResponseSteps.MonthlyExpensesDetails('1200','45', '25', '30', '100', '125');
    ResponseSteps.MonthlyIncomeDetails('4500', '120', '1100');
    ResponseSteps.EnterExplanation();
  }
}

module.exports = new CommonSteps();