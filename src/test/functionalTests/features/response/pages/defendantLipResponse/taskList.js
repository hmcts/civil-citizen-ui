const I = actor();
const config = require('../../../../../config');
const {language} = require('../../../../sharedData')

const content = {
  heading: {
    en: 'Respond to a money claim',
    cy: 'Ymateb i hawliad ariannol'
  }
}

class TaskListPage {
  verifyResponsePageContent() {
    I.waitForText(responsePageHeading, content.heading[language]);
  }
}

module.exports = TaskListPage;
