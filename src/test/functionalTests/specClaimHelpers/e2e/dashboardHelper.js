const I = actor();

const steps = require('../api/steps');

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: 'div.govuk-notification-banner__content',
  dashboardNotification: '.dashboard-notification',
};

const NOTIFICATION_VERIFY_MAX_RETRIES = 15;
const NOTIFICATION_VERIFY_RETRY_WAIT_SEC = 5;

const notificationMatches = (pageSource, title, content) => {
  if (!pageSource.includes(title)) {
    return false;
  }
  if (Array.isArray(content)) {
    return content.every((text) => pageSource.includes(text));
  }
  return pageSource.includes(content);
};

module.exports = {
  verifyNotificationTitleAndContent: async (claimNumber = '', title, content, claimRef) => {
    const currentUrl = await I.grabCurrentUrl();
    if (claimNumber && claimNumber !== '' && claimRef && !currentUrl.includes(claimRef)) {
      await I.amOnPage('/dashboard');
      await I.click(claimNumber);
    }
    for (let tries = 1; tries <= NOTIFICATION_VERIFY_MAX_RETRIES; tries++) {
      console.log('Verifying notification title and content... attempt', tries);

      await I.waitForVisible(selectors.dashboardNotification, 30);
      const pageSource = await I.grabTextFrom(selectors.dashboardNotification);
      console.log('Title to be verified ..', title);

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
