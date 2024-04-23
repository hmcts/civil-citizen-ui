const I = actor();

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
    await I.waitForContent(title);
    await I.waitForVisible(selectors.titleClass, 60);
    await I.waitForVisible(selectors.contentClass, 60);
    if (Array.isArray(content)) {
      for (let i = 0; i < content.length; i++) {
        await I.see(content[i]);
      }
    } else {
      await I.see(content);
    }
  },
};