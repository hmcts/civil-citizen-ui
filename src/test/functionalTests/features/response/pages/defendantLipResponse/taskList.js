const I = actor();
const config = require('../../../../../config');
const {language} = require('../../../../sharedData');

const content = {
  heading: {
    en: 'Respond to a money claim',
    cy: 'Ymateb i hawliad ariannol',
  },
};

class TaskListPage {
  verifyResponsePageContent() {
    console.log(language);
    I.waitForText(content.heading[language], config.WaitForTimeout);
  }
}

module.exports = TaskListPage;
