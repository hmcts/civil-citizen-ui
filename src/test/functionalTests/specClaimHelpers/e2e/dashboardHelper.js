const I = actor();

const steps = require('../api/steps');
const config = require('../../../config');

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: 'div.govuk-notification-banner__content',
  dashboardNotification: '.dashboard-notification',
  notificationBanner: '.dashboard-notification .govuk-notification-banner',
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

const getDashboardPath = (party) => (party === 'claimant' ? 'claimantNewDesign' : 'defendant');

const escapeXPathLiteral = (value) => {
  const singleQuote = '\'';
  if (!value.includes(singleQuote)) {
    return singleQuote + value + singleQuote;
  }
  if (!value.includes('"')) {
    return '"' + value + '"';
  }
  const parts = value.split(singleQuote);
  return 'concat(' + parts.map((part) => singleQuote + part + singleQuote).join(', ' + singleQuote + ', ') + ')';
};

const bannerXPathForTitle = (title) =>
  `//div[contains(@class,'dashboard-notification')]//div[contains(@class,'govuk-notification-banner')][contains(normalize-space(.), ${escapeXPathLiteral(title)})]`;

const isOnCaseDashboard = (url) => /\/dashboard\/[^/]+\/(defendant|claimant|claimantNewDesign)/.test(url);

const notificationMatches = (pageSource, title, content) => {
  if (!pageSource.includes(title)) {
    return false;
  }
  if (Array.isArray(content)) {
    return content.every((text) => pageSource.includes(text));
  }
  if (content) {
    return pageSource.includes(content);
  }
  return true;
};

const openClaimDashboard = async (claimNumber, claimRef, party = 'defendant') => {
  const currentUrl = await I.grabCurrentUrl();

  if (claimRef && currentUrl.includes(String(claimRef))) {
    return;
  }

  if (claimRef) {
    await I.amOnPage(`/dashboard/${claimRef}/${getDashboardPath(party)}`);
    return;
  }

  if (!claimNumber) {
    return;
  }

  if (isOnCaseDashboard(currentUrl)) {
    return;
  }

  await I.amOnPage('/dashboard');
  await I.waitForText(claimNumber, 30);
  await I.click(claimNumber);
};

const grabNotificationPageSource = async (title) => {
  const bannerXPath = bannerXPathForTitle(title);
  const bannerVisible = await I.waitForVisible(bannerXPath, 3).then(() => true).catch(() => false);
  if (bannerVisible) {
    return I.grabTextFrom(bannerXPath);
  }
  return I.grabTextFrom(selectors.dashboardNotification);
};

const isDashboardNotificationVisible = async () => I.waitForVisible(selectors.notificationBanner, DASHBOARD_NOTIFICATION_WAIT_TIMEOUT)
  .then(() => true)
  .catch(() => false);

module.exports = {
  verifyNotificationTitleAndContent: async (
    claimNumber = '',
    title,
    content,
    claimRef,
    party = 'defendant',
  ) => {
    await I.wait(2);

    for (let tries = 1; tries <= NOTIFICATION_VERIFY_MAX_RETRIES; tries++) {
      console.log('Verifying notification title and content... attempt', tries);
      console.log('Title to be verified ..', title);
      console.log(`Using dashboard notification timeout: ${DASHBOARD_NOTIFICATION_WAIT_TIMEOUT} seconds`);

      await openClaimDashboard(claimNumber, claimRef, party);

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

      const pageSource = await grabNotificationPageSource(title);

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
        I.seeElement(tasklistLocator);
      } else {
        console.log(`This failed because the tasklist "${tasklist}" is not a link`);
      }
    } else {
      const linkDoesNotExist = await I.waitForInvisible(tasklistLocator, 1).then(() => true).catch(() => false);
      if (linkDoesNotExist) {
        I.dontSeeElement(tasklistLocator);
      } else {
        console.log(`This failed because the tasklist "${tasklist}" is a link`);
      }
    }
  },
};
