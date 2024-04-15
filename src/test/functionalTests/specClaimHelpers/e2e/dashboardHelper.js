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
    await I.see(title, selectors.titleClass);
    if (Array.isArray(content)) {
      for (let i = 0; i < content.length; i++) {
        console.log('value verified is ..', content[i]);
        await I.see(content[i], selectors.contentClass);
      }
    } else {
      await I.see(content, selectors.contentClass);
    }
  },
};