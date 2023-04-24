const I = actor();

class TaskListPage {
  verifyResponsePageContent() {
    I.see('Respond to a money claim');
  }
}

module.exports = TaskListPage;
