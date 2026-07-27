const I = actor();

const {waitForFinishedBusinessProcess} = require('../api/steps');

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: 'div.govuk-notification-banner__content',
};

const getCaseDashboardPath = (claimRef, partyRole = 'claimant') =>
  partyRole === 'defendant'
    ? `/dashboard/${claimRef}/defendant`
    : `/dashboard/${claimRef}/claimantNewDesign`;

const normaliseText = text => text.replace(/\s+/g, ' ').trim();

const navigateToClaimIfNeeded = async (claimNumber, claimRef, partyRole = 'claimant') => {
  const currentUrl = await I.grabCurrentUrl();
  if (claimRef && currentUrl.includes(claimRef)) {
    return;
  }

  if (claimRef) {
    await I.amOnPage(getCaseDashboardPath(claimRef, partyRole));
    return;
  }

  if (claimNumber && claimNumber !== '') {
    await I.amOnPage('/dashboard');
    await I.clickClaimNumber(claimNumber);
  }
};

module.exports = {
  verifyNotificationTitleAndContent: async (claimNumber = '', title, content, claimRef, partyRole = 'claimant') => {
    await navigateToClaimIfNeeded(claimNumber, claimRef, partyRole);
    const maxRetries = 15;
    const retryDelaySeconds = 4;
    let lastPageSource = '';
    for (let tries = 1; tries <= maxRetries; tries++) {
      console.log('Verifying notification title and content... attempt', tries);

      lastPageSource = await I.grabTextFrom('.dashboard-notification');
      const normalisedPageSource = normaliseText(lastPageSource);
      const titleFound = normalisedPageSource.includes(normaliseText(title));
      console.log('Title to be verified ..', title, `(found: ${titleFound})`);

      if (titleFound) {
        if (Array.isArray(content)) {
          const missingContent = content.filter(text => {
            const contentFound = normalisedPageSource.includes(normaliseText(text));
            console.log('content to be verified ..', text, `(found: ${contentFound})`);
            return !contentFound;
          });
          if (missingContent.length === 0) {
            return;
          }
        } else {
          const contentFound = normalisedPageSource.includes(normaliseText(content));
          console.log('content to be verified ..', content, `(found: ${contentFound})`);
          if (contentFound) {
            return;
          }
        }
      }

      if (tries === maxRetries) {
        throw new Error(
          `Notification could not be verified after ${maxRetries} attempts. `
          + `Expected title: "${title}". `
          + `Expected content: ${JSON.stringify(content)}. `
          + `Dashboard notification area contained: "${lastPageSource.slice(0, 500)}"`,
        );
      }

      // The notification may still be generating on a slow environment; give the
      // business process time to finish before refreshing and re-checking.
      await waitForFinishedBusinessProcess();
      await I.wait(retryDelaySeconds);
      await I.refreshPage();
    }
  },

  verifyNotificationAbsent: async (claimNumber = '', title, claimRef, partyRole = 'claimant') => {
    await navigateToClaimIfNeeded(claimNumber, claimRef, partyRole);
    await waitForFinishedBusinessProcess();

    const maxRetries = 3;
    let lastPageSource = '';
    for (let tries = 1; tries <= maxRetries; tries++) {
      lastPageSource = await I.grabTextFrom('.dashboard-notification');
      const normalisedPageSource = normaliseText(lastPageSource);
      const titleFound = normalisedPageSource.includes(normaliseText(title));
      console.log('Verifying notification is absent ..', title, `(found: ${titleFound})`);

      if (!titleFound) {
        return;
      }

      if (tries === maxRetries) {
        throw new Error(
          `Notification "${title}" should not be present but was found after ${maxRetries} attempts. `
          + `Dashboard notification area contained: "${lastPageSource.slice(0, 500)}"`,
        );
      }

      await waitForFinishedBusinessProcess();
      await I.wait(4);
      await I.refreshPage();
    }
  },

  verifyTasklistLinkAndState: async (tasklist, locator, status, isLinkFlag= false, isDeadlinePresent= false, deadline, claimNumber = '', claimRef, partyRole = 'claimant') => {
    //Step to check if status is already updated, if not it will refresh the page
    if (claimNumber || claimRef) {
      await navigateToClaimIfNeeded(claimNumber, claimRef, partyRole);
    }
    await I.waitForVisible(selectors.titleClass, 60);
    // The task status may still be settling on a slow environment; refresh a few
    // times until it reflects the expected value before asserting.
    const maxRetries = 5;
    for (let tries = 1; tries <= maxRetries; tries++) {
      const actualStatus = await I.grabTextFrom(locator);
      if (actualStatus.toLowerCase().includes(status.toLowerCase()) || tries === maxRetries) {
        break;
      }
      await I.wait(3);
      await waitForFinishedBusinessProcess();
      await I.refreshPage();
    }
    await I.see(tasklist, locator);
    await I.see(status, locator);
    if (isLinkFlag === true) {
      await I.seeElement(`//a[contains(@class, "govuk-link")][normalize-space(.)="${tasklist}"]`);
    } else {
      await I.dontSeeElement(`//a[contains(@class, "govuk-link")][normalize-space(.)="${tasklist}"]`);
    }
    if (isDeadlinePresent === true) {
      await I.see(deadline, locator);
    }
    const tasklistLocator = `//a[contains(@class, "govuk-link")][normalize-space(.)="${tasklist}"]`;
    if (isLinkFlag === true) {
      const linkExists = await I.waitForVisible(tasklistLocator, 1).then(() => true).catch(() => false);
      if (linkExists) {
        await I.seeElement(tasklistLocator);  // The element is found, so we assert it.
      } else {
        console.log(`This failed because the tasklist "${tasklist}" is not a link`);
      }
    } else {
      const linkDoesNotExist = await I.waitForInvisible(tasklistLocator, 1).then(() => true).catch(() => false);
      if (linkDoesNotExist) {
        await I.dontSeeElement(tasklistLocator);  // The element is not found, so we assert its absence.
      } else {
        console.log(`This failed because the tasklist "${tasklist}" is a link`);
      }
    }
  },
};
