const I = actor();

const {waitForFinishedBusinessProcess} = require('../api/steps');

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: 'div.govuk-notification-banner__content',
};

module.exports = {
  verifyNotificationTitleAndContent: async (claimNumber = '', title, content, claimRef) => {
    const currentUrl = await I.grabCurrentUrl();
    if (claimNumber && claimNumber !== '' && !currentUrl.includes(claimRef)) {
      await I.amOnPage('/dashboard');
      await I.click(claimNumber);
    }
    const maxRetries = 15;
    const retryDelaySeconds = 4;
    let lastPageSource = '';
    for (let tries = 1; tries <= maxRetries; tries++) {
      console.log('Verifying notification title and content... attempt', tries);

      lastPageSource = await I.grabTextFrom('.dashboard-notification');
      const titleFound = lastPageSource.includes(title);
      console.log('Title to be verified ..', title, `(found: ${titleFound})`);

      if (titleFound) {
        if (Array.isArray(content)) {
          const missingContent = content.filter(text => {
            const contentFound = lastPageSource.includes(text);
            console.log('content to be verified ..', text, `(found: ${contentFound})`);
            return !contentFound;
          });
          if (missingContent.length === 0) {
            return;
          }
        } else {
          const contentFound = lastPageSource.includes(content);
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

      await I.wait(retryDelaySeconds);
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
      await waitForFinishedBusinessProcess();
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
