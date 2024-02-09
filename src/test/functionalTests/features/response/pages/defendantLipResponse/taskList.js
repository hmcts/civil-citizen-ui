const I = actor();
const config = require('../../../../../config');

const pageContent = {
  responsePageHeading: {
    en: 'Respond to a money claim',
    cy: 'Ymateb i hawliad ariannol'
  }
}

class TaskListPage {
  verifyResponsePageContent(language = 'en') {
    I.waitForText(responsePageHeading, pageContent.responsePageHeading[language]);
  }
}

module.exports = TaskListPage;
