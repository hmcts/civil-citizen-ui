const I = actor();

const steps = require('../api/steps');
const config = require('../../../config');

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: 'div.govuk-notification-banner__content',
  dashboardNotification: '.dashboard-notification',
};

const isSlowTestEnvironment = () => {
  const environment = (config.env || '').toLowerCase();
  const civilServiceUrl = (config.url?.civilService || '').toLowerCase();
  const testUrl = (config.TestUrl || process.env.TEST_URL || '').toLowerCase();
  return environment === 'aat'
    || environment === 'preview'
    || civilServiceUrl.includes('preview')
    || testUrl.includes('preview');
};

const NOTIFICATION_VERIFY_MAX_RETRIES = 15;
const NOTIFICATION_VERIFY_RETRY_WAIT_SEC = 5;
const DASHBOARD_NOTIFICATION_WAIT_TIMEOUT = isSlowTestEnvironment() ? 45 : 20;

const notificationMatches = (pageSource, title, content) => {
  if (!pageSource.includes(title)) {
    return false;
  }
  if (Array.isArray(content)) {
    return content.every((text) => pageSource.includes(text));
  }
  return pageSource.includes(content);
};

const openClaimDashboard = async (claimNumber, claimRef) => {
  if (!claimNumber) {
    return;
  }
  const currentUrl = await I.grabCurrentUrl();
  if (!claimRef || currentUrl.includes(claimRef)) {
    return;
  }
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
};

const isDashboardNotificationVisible = async () => I.waitForVisible(selectors.dashboardNotification, DASHBOARD_NOTIFICATION_WAIT_TIMEOUT)
  .then(() => true)
  .catch(() => false);

module.exports = {
  verifyNotificationTitleAndContent: async (claimNumber = '', title, content, claimRef) => {
    // Add initial wait to allow dashboard data to load after login
    await I.wait(2);
    
    for (let tries = 1; tries <= NOTIFICATION_VERIFY_MAX_RETRIES; tries++) {
      console.log('Verifying notification title and content... attempt', tries);
      console.log('Title to be verified ..', title);
      console.log(`Using dashboard notification timeout: ${DASHBOARD_NOTIFICATION_WAIT_TIMEOUT} seconds`);

      await openClaimDashboard(claimNumber, claimRef);

      if (!(await isDashboardNotificationVisible())) {
        if (tries === NOTIFICATION_VERIFY_MAX_RETRIES) {
          throw new Error(
            `Notification could not be verified after ${NOTIFICATION_VERIFY_MAX_RETRIES} attempts. `
            + `Expected title: "${title}". The dashboard notification panel was not visible after ${DASHBOARD_NOTIFICATION_WAIT_TIMEOUT}s wait.`,
          );
        }
        console.log(`Dashboard notification not visible on attempt ${tries}, waiting ${NOTIFICATION_VERIFY_RETRY_WAIT_SEC}s before retry...`);
        await I.wait(NOTIFICATION_VERIFY_RETRY_WAIT_SEC);
        await I.refreshPage();
        continue;
      }

      const pageSource = await I.grabTextFrom(selectors.dashboardNotification);

      if (notificationMatches(pageSource, title, content)) {
        if (Array.isArray(content)) {
          content.forEach((text) => console.log('content to be verified ..', text));
        } else {
          console.log('content to be verified ..', content);
        }
        return;
      }

      if (tries === NOTIFICATION_VERIFY_MAX_RETRIES) {
        const snippet = pageSource.replace(/\s+/g, ' ').trim().slice(0, 500);
        throw new Error(
          `Notification could not be verified after ${NOTIFICATION_VERIFY_MAX_RETRIES} attempts. `
          + `Expected title: "${title}". Page snippet: "${snippet}"`,
        );
      }

      console.log(`Notification content mismatch on attempt ${tries}, waiting ${NOTIFICATION_VERIFY_RETRY_WAIT_SEC}s before retry...`);
      await I.wait(NOTIFICATION_VERIFY_RETRY_WAIT_SEC);
      await I.refreshPage();
    }
  },

  verifyTasklistLinkAndState: async (tasklist, locator, status, isLinkFlag= false, isDeadlinePresent= false, deadline, claimNumber = '') => {
    //Step to check if status is already updated, if not it will refresh the page
    if (claimNumber && claimNumber != '') {
      await I.amOnPage('/dashboard');
      await I.click(claimNumber);
    }
    await I.waitForVisible(selectors.titleClass, 60);
    const actualStatus = await I.grabTextFrom(locator);
    if (!actualStatus.toLowerCase().includes(status.toLowerCase())) {
      await I.wait(3);
      await steps.waitForFinishedBusinessProcess();
      await I.refreshPage();
    }
    await I.see(tasklist, locator);
    await I.see(status, locator);
    if (isLinkFlag === true) {
      I.seeElement(`//a[contains(@class, "govuk-link")][normalize-space(.)="${tasklist}"]`);
    } else {
      I.dontSeeElement(`//a[contains(@class, "govuk-link")][normalize-space(.)="${tasklist}"]`);
    }
    if (isDeadlinePresent === true) {
      await I.see(deadline, locator);
    }
    const tasklistLocator = `//a[contains(@class, "govuk-link")][normalize-space(.)="${tasklist}"]`;
    if (isLinkFlag === true) {
      const linkExists = await I.waitForVisible(tasklistLocator, 1).then(() => true).catch(() => false);
      if (linkExists) {
        I.seeElement(tasklistLocator);  // The element is found, so we assert it.
      } else {
        console.log(`This failed because the tasklist "${tasklist}" is not a link`);
      }
    } else {
      const linkDoesNotExist = await I.waitForInvisible(tasklistLocator, 1).then(() => true).catch(() => false);
      if (linkDoesNotExist) {
        I.dontSeeElement(tasklistLocator);  // The element is not found, so we assert its absence.
      } else {
        console.log(`This failed because the tasklist "${tasklist}" is a link`);
      }
    }
  },
};
