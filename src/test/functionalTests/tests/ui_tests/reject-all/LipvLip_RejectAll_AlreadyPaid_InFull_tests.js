const config = require("../../../../config");
const { createAccount } = require("../../../specClaimHelpers/api/idamHelper");
const LoginSteps = require("../../../commonFeatures/home/steps/login");
const ResponseToDefenceLipVsLipSteps = require("../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps");
const nocSteps = require("../../../lrFeatures/noc/steps/nocSteps");
const {
  nocForLip,
} = require("../../../specClaimHelpers/dashboardNotificationConstants");
const {
  verifyNotificationTitleAndContent,
} = require("../../../specClaimHelpers/e2e/dashboardHelper");
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = "yesIWantMoretime";
const {
  defendantResponseFullDefenceAlreadyPaid,
} = require("../../../specClaimHelpers/dashboardNotificationConstants");
let claimRef, claimType;
let caseData;
let claimNumber, defendantName;

Feature(
  "Response with RejectAll-AlreadyPaid-InFull - Small Claims & Fast Track",
).tag("@civil-citizen-nightly @ui-reject-all");

Scenario(
  "Response with RejectAll-AlreadyPaid-InFull Small claims and Claimant settle",
  async ({ I, api }) => {
    await createAccount(
      config.claimantCitizenUser.email,
      config.claimantCitizenUser.password,
    );
    await createAccount(
      config.defendantCitizenUser.email,
      config.defendantCitizenUser.password,
    );
    claimType = "SmallClaims";
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(
      config.defendantCitizenUser,
      claimRef,
      claimType,
      config.defenceType.rejectAllAlreadyPaidInFullWithIndividual,
    );
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(
      config.claimantCitizenUser.email,
      config.claimantCitizenUser.password,
    );
    // check notification
    await I.amOnPage("/dashboard");
    await I.click(claimNumber);
    await I.amOnPage("/dashboard/" + claimRef + "/claimantNewDesign");
    await I.refreshPage();
    await I.waitForElement(".dashboard-notification", 10);
    const notificationBanner = locate(".govuk-notification-banner").withText(
      "Response to the claim",
    );
    await I.waitForElement(notificationBanner, 10);
    const notificationText = await I.grabTextFrom(notificationBanner);
    const normalisedNotificationText = notificationText
      .replace(/\s+/g, " ")
      .trim();
    const match = normalisedNotificationText.match(
      /The defendant has said they already paid (.+?) on (.+?)\. You can confirm payment and settle, or proceed with the claim\. You need to respond by (.+?) on (.+?) or the claim will not continue\./,
    );
    if (!match) {
      throw new Error(
        `Could not extract payment and deadline details from notification text: ${normalisedNotificationText}`,
      );
    }
    const claimSettledAmount = match[1];
    const claimSettledDateEn = match[2];
    const defaultRespondTime = match[3];
    const applicant1ResponseDeadlineEn = match[4];
    console.log("Extracted notification values:", {
      claimSettledAmount,
      claimSettledDateEn,
      defaultRespondTime,
      applicant1ResponseDeadlineEn,
    });
    const defendantNotification = defendantResponseFullDefenceAlreadyPaid(
      claimSettledAmount,
      claimSettledDateEn,
      defaultRespondTime,
      applicant1ResponseDeadlineEn,
    );
    console.log("title:", defendantNotification.title);
    console.log("content:", defendantNotification.content);
    await verifyNotificationTitleAndContent(
      claimNumber,
      defendantNotification.title,
      defendantNotification.content,
    );
    // One of the step in the below method is commented until https://tools.hmcts.net/jira/browse/CIV-13496 is fixed
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceAlreadyPaidInFull(
      claimRef,
      claimNumber,
    );
    await api.waitForFinishedBusinessProcess();
  },
);

Scenario(
  "Response with RejectAll-AlreadyPaid-InFull Fast Track and Claimant proceeds",
  async ({ I, api }) => {
    await createAccount(
      config.claimantCitizenUser.email,
      config.claimantCitizenUser.password,
    );
    await createAccount(
      config.defendantCitizenUser.email,
      config.defendantCitizenUser.password,
    );
    claimType = "FastTrack";
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    defendantName = await caseData.respondent1.partyName;
    await api.performCitizenResponse(
      config.defendantCitizenUser,
      claimRef,
      claimType,
      config.defenceType.rejectAllAlreadyPaidInFullWithIndividual,
    );
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(
      config.claimantCitizenUser.email,
      config.claimantCitizenUser.password,
    );

    // check notification
    await I.amOnPage("/dashboard");
    await I.click(claimNumber);
    await I.amOnPage("/dashboard/" + claimRef + "/claimantNewDesign");
    await I.refreshPage();
    await I.waitForElement(".dashboard-notification", 10);
    const notificationBanner = locate(".govuk-notification-banner").withText(
      "Response to the claim",
    );
    await I.waitForElement(notificationBanner, 10);
    const notificationText = await I.grabTextFrom(notificationBanner);
    const normalisedNotificationText = notificationText
      .replace(/\s+/g, " ")
      .trim();
    const match = normalisedNotificationText.match(
      /The defendant has said they already paid (.+?) on (.+?)\. You can confirm payment and settle, or proceed with the claim\. You need to respond by (.+?) on (.+?) or the claim will not continue\./,
    );
    if (!match) {
      throw new Error(
        `Could not extract payment and deadline details from notification text: ${normalisedNotificationText}`,
      );
    }
    const claimSettledAmount = match[1];
    const claimSettledDateEn = match[2];
    const defaultRespondTime = match[3];
    const applicant1ResponseDeadlineEn = match[4];
    console.log("Extracted notification values:", {
      claimSettledAmount,
      claimSettledDateEn,
      defaultRespondTime,
      applicant1ResponseDeadlineEn,
    });
    const defendantNotification = defendantResponseFullDefenceAlreadyPaid(
      claimSettledAmount,
      claimSettledDateEn,
      defaultRespondTime,
      applicant1ResponseDeadlineEn,
    );
    console.log("title:", defendantNotification.title);
    console.log("content:", defendantNotification.content);
    await verifyNotificationTitleAndContent(
      claimNumber,
      defendantNotification.title,
      defendantNotification.content,
    );

    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnRejectionOfFullDefenceAlreadyPaidInFull(
      claimRef,
      claimNumber,
    );
    await api.waitForFinishedBusinessProcess();
    await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(
      claimRef,
      defendantName,
      config.defendantSolicitorUser,
    );
    await api.checkUserCaseAccess(config.defendantCitizenUser, false);
    await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

    await LoginSteps.EnterCitizenCredentials(
      config.claimantCitizenUser.email,
      config.claimantCitizenUser.password,
    );
    await I.amOnPage("/dashboard");
    await I.click(claimNumber);

    const nocForLipNotif = nocForLip(defendantName);
    await verifyNotificationTitleAndContent(
      claimNumber,
      nocForLipNotif.title,
      nocForLipNotif.content,
    );
    await I.click(nocForLipNotif.nextSteps);
  },
);
