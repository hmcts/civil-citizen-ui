const config = require('../../../../config');
const DefendantLinkingPage = require('../pages/defendantLinking');

const {I} = inject();

class DefendantLinkingSteps {
  async LinkDefendantToClaimAsCTSCAdmin(
    claimReference,
    defendantEmail,
  ) {
    await this.OpenManageCase();
    await this.LoginAsCTSCAdmin();
    await this.NavigateToCaseSearch();
    await this.SearchForCase(claimReference);
    await this.LinkDefendant(defendantEmail);
    await this.SignOut();
  }

  async OpenManageCase() {
    await I.amOnPage(config.url.manageCase);
  }

  async LoginAsCTSCAdmin() {
    await I.waitForElement(
      DefendantLinkingPage.username,
      30,
    );

    await I.fillField(
      DefendantLinkingPage.username,
      config.ctscAdmin.email,
    );

    await I.fillField(
      DefendantLinkingPage.password,
      config.ctscAdmin.password,
    );

    await I.click(
      DefendantLinkingPage.signInButton,
    );
  }

  async NavigateToCaseSearch() {
    await I.waitForElement(
      DefendantLinkingPage.searchNavigationLink,
      30,
    );

    await I.click(
      DefendantLinkingPage.searchNavigationLink,
    );

    await I.waitForText(
      DefendantLinkingPage.caseReferenceField,
      30,
    );
  }

  async SearchForCase(claimReference) {
    await I.fillField(
      DefendantLinkingPage.caseReferenceField,
      String(claimReference),
    );

    await I.click(
      DefendantLinkingPage.findButton,
    );

    await I.waitForText(
      DefendantLinkingPage.nextStepDropdown,
      30,
    );
  }

  async LinkDefendant(defendantEmail) {
    await I.selectOption(
      DefendantLinkingPage.nextStepDropdown,
      DefendantLinkingPage.linkDefendantEvent,
    );

    await I.click(
      DefendantLinkingPage.goButton,
    );

    await I.waitForText(
      DefendantLinkingPage.linkDefendantHeading,
      30,
    );

    await I.fillField(
      DefendantLinkingPage.defendantEmailField,
      defendantEmail,
    );

    await I.click(
      DefendantLinkingPage.linkDefendantButton,
    );

    await I.waitForText(
      DefendantLinkingPage.linkingSuccessMessage,
      30,
    );
  }

  async SignOut() {
    await I.click(
      DefendantLinkingPage.signOutButton,
    );
  }
}

module.exports = new DefendantLinkingSteps();
