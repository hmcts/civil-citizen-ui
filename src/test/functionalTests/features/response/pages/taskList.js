const I = actor();

export class TaskListPage {

  open(claimRef) {
    I.amOnPage('/case/' + claimRef + '/response/task-list');
  }

  verifyResponsePageContent() {
    I.see('Respond to a money claim');
  }
}
