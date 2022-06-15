import I = CodeceptJS.I
import { TaskListPage } from '../pages/taskList';
import { NameAndAddressDetailsPage } from '../pages/enterNameAndAddressDetails';
import { DateOfBirthDetailsPage } from '../pages/enterDateOfBirthDetails';
import { ContactNumberDetailsPage } from '../pages/enterContactNumberDetails';
import { RespondTypePage } from '../pages/respondType';
import { PaymentOptionPage } from '../pages/paymentOption';
import { CheckYourAnswersPage } from '../pages/checkYourAnswers';

const I: I = actor();
const taskListPage: TaskListPage = new TaskListPage();
const nameAndAddressDetailsPage: NameAndAddressDetailsPage  = new NameAndAddressDetailsPage();
const dateOfBirthDetailsPage: DateOfBirthDetailsPage = new DateOfBirthDetailsPage();
const contactNumberDetailsPage: ContactNumberDetailsPage = new ContactNumberDetailsPage();
const respondTypePage: RespondTypePage = new RespondTypePage();
const paymentOptionPage: PaymentOptionPage = new PaymentOptionPage();
const checkYourAnswersPage: CheckYourAnswersPage = new CheckYourAnswersPage();

export class ResponseSteps {

  VerifyResponsePageContent (claimRef: string): void {
    taskListPage.open(claimRef);
    taskListPage.verifyResponsePageContent();
  }
  EnterNameAndAddressDetails (claimRef: string): void {
    nameAndAddressDetailsPage.enterNameAndAddressDetails(claimRef);
  }
  EnterDateOfBirth (claimRef: string): void {
    dateOfBirthDetailsPage.enterDateOfBirth(claimRef);
  }
  EnterContactNumber (claimRef: string): void {
    contactNumberDetailsPage.enterContactNumber(claimRef);
  }
  EnterResponseToClaim(claimRef: string, responseType: string): void {
    respondTypePage.enterResponseToClaim(claimRef, responseType);
  }
  EnterPaymentOption(claimRef: string, paymentOption: string): void {
    paymentOptionPage.enterPaymentOption(claimRef, paymentOption);
  }
  CheckAndSubmit(claimRef: string): void {
    checkYourAnswersPage.checkAndSubmit(claimRef);
  }
}
