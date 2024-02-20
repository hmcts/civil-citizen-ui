const I = actor();
const config = require('../../../../../config');

class TaskListPage {
  verifyResponsePageContent() {
    I.waitForText('Respond to a money claim', config.WaitForText);
  }
}

module.exports = TaskListPage;
