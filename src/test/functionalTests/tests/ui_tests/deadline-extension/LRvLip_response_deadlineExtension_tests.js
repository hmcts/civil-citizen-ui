const config = require("../../../../config");
const ResponseSteps = require("../../../citizenFeatures/response/steps/lipDefendantResponseSteps");
const LoginSteps = require("../../../commonFeatures/home/steps/login");
const CitizenDashboardSteps = require("../../../citizenFeatures/citizenDashboard/steps/citizenDashboard");
const { createAccount } = require("../../../specClaimHelpers/api/idamHelper");
const {
  verifyNotificationTitleAndContent,
} = require("../../../specClaimHelpers/e2e/dashboardHelper");
const I = actor();
const iHaveAlreadyAgreedMoretime = "iHaveAlreadyAgreedMoretime";
let claimRef;
let caseData;
let claimNumber;
let securityCode;
const {
  defendantNotificationMoreTimeRequested,
} = require("../../../specClaimHelpers/dashboardNotificationConstants");

Feature("Extended Response Time").tag(
  "@civil-citizen-nightly @ui-deadline-extension",
);

Before(async ({ api }) => {
  await createAccount(
    config.defendantCitizenUser.email,
    config.defendantCitizenUser.password,
  );
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log("Claim has been created Successfully    <===>  ", claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log("claim number", claimNumber);
  console.log("Security code", securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  await LoginSteps.EnterCitizenCredentials(
    config.defendantCitizenUser.email,
    config.defendantCitizenUser.password,
  );
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

//Skipped dependant on the release DTSCCI-2558
Scenario("No response submitted, date agreed upon request time", async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(
    claimRef,
    iHaveAlreadyAgreedMoretime,
  );
  await ResponseSteps.DefendantSummaryPage(claimRef);

  // notification verification
  await I.refreshPage();
  await I.waitForElement(".dashboard-notification", 10);

  const moreTimeBanner = locate(".govuk-notification-banner").withText(
    "More time requested",
  );
  await I.waitForElement(moreTimeBanner, 10);
  const notificationText = await I.grabTextFrom(moreTimeBanner);
  const normalisedNotificationText = notificationText
    .replace(/\s+/g, " ")
    .trim();
  const match = normalisedNotificationText.match(
    /The response deadline is now (.+?) on (.+?)\. There are (\d+) days remaining/,
  );
  if (!match) {
    throw new Error(
      `Could not extract deadline details from notification text: ${normalisedNotificationText}`,
    );
  }

  const deadlineTime = match[1];
  const deadlineDate = match[2];
  const daysToRespond = Number(match[3]);

  console.log("Extracted deadline values:", {
    deadlineTime,
    deadlineDate,
    daysToRespond,
  });

  const defendantNotification = defendantNotificationMoreTimeRequested(
    deadlineTime,
    deadlineDate,
    daysToRespond,
  );

  console.log(
    "Defendant NotificationdefendantNotification.title:",
    defendantNotification.title,
  );
  console.log(
    "Defendant NotificationdefendantNotification.content:",
    defendantNotification.content,
  );
  await verifyNotificationTitleAndContent(
    claimNumber,
    defendantNotification.title,
    defendantNotification.content,
  );
});
