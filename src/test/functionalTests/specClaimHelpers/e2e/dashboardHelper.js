const I = actor();

const {waitForFinishedBusinessProcess} = require('../api/steps');

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: 'div.govuk-notification-banner__content',
};

module.exports = {
  verifyNotificationTitleAndContent: async (claimNumber = '', title, content) => {
    if (claimNumber && claimNumber != '') {
      await I.amOnPage('/dashboard');
      await I.click(claimNumber);
    }
    console.log('Title to be verified ..', title);
    await I.waitForContent(title);
    await I.waitForVisible(selectors.titleClass, 60);
    await I.waitForVisible(selectors.contentClass, 60);
    if (Array.isArray(content)) {
      for (let i = 0; i < content.length; i++) {
        await I.see(content[i]);
        console.log('content to be verified ..', content[i]);
      }
    } else {
      await I.see(content);
      console.log('content to be verified ..', content);
    }
  },

  verifyTasklistLinkAndState: async (tasklist, locator, status, isLinkFlag= false, isDeadlinePresent= false, deadline) => {
    //Step to check if status is already updated, if not it will refresh the page
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
    } else {
      I.dontSee(deadline, locator);
    }
  },
};
