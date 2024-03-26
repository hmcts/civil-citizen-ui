const I = actor();

const selectors = {
  titleClass: '.govuk-notification-banner__title',
  contentClass: '.govuk-notification-banner__content',
};

module.exports = {
  verifyNotificationTitleAndContent: async (claimNumber = '', title, content) => {
    if (claimNumber && claimNumber != '') {
      await I.amOnPage('/dashboard');
      await I.click(claimNumber);
    }
    await I.waitForContent(title);
    await I.see(title, selectors.titleClass);
    await I.see(content, selectors.contentClass);
  },
};