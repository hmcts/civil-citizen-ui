import I = CodeceptJS.I
import { ResponsePage } from '../pages/prepareYourResponse';

const I: I = actor();
const responsePage: ResponsePage = new ResponsePage();

export class ResponseSteps {

  VerifyResponsePageContent (claimRef: string): void {
    responsePage.open(claimRef);
    responsePage.verifyResponsePageContent();
  }
  EnterConfirmYourDetails (claimRef: string): void {
    responsePage.enterConfirmYourDetails(claimRef);
  }
  EnterDateOfBirth (claimRef: string): void {
    responsePage.enterDateOfBirth(claimRef);
  }
  EnterContactNumber (claimRef: string): void {
    responsePage.enterContactNumber(claimRef);
  }
}
