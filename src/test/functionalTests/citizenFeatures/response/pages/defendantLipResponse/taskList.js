const I = actor();
const config = require('../../../../../config');
const sharedData= require('../../../../sharedData');

const content = {
  heading: {
    en: 'Respond to a money claim',
    cy: 'Ymateb i hawliad ariannol',
  },
};

class TaskListPage {
  verifyResponsePageContent() {
    I.waitForContent(content.heading[sharedData.language], config.WaitForTimeout);
  }
}

module.exports = TaskListPage;
