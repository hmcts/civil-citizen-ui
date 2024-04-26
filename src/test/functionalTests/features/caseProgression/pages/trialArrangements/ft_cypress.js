import ContactUs from '../../../common/contactUs';

const cy = require('cypress');
const contactUs = new ContactUs();

class CheckYourAnswers {

  checkPageFullyLoaded () {
    cy.get('//a[.=\'Cancel\']').should('be.visible');
  }

  nextAction (nextAction) {
    cy.get(nextAction).click();
  }

  verifyPageContent() {
    this.checkPageFullyLoaded();
    this.verifyHeadingDetails();
    this.verifyCheckYourAnswersContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    cy.contains('Check your answers').should('be.visible');
    //cy.contains('Case reference').should('be.visible');
    cy.contains('Test Inc v Sir John Doe').should('be.visible');
  }

  verifyCheckYourAnswersContent(readyForTrial) {
    cy.contains('Is the case ready for trial?').should('be.visible');
    if (readyForTrial==='no'){
      cy.contains('No').should('be.visible');
    } else {
      cy.contains('Yes').should('be.visible');
    }
    cy.contains('Are there any changes to support with access needs or vulnerability for anyone attending a court hearing?').should('be.visible');
    cy.contains('Autoation Test execution of Trial Arrangeents...%$£').should('be.visible');
    cy.contains('Other information').should('be.visible');
    cy.contains('Autoation Testing for Other Information of the Trial Arrangement Section......%$£^').should('be.visible');
  }
}

export default CheckYourAnswers;
