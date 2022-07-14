import I = CodeceptJS.I

const I: I = actor();

export class TaskListPage {

  open(claimRef): void {
    I.amOnPage('/case/' + claimRef + '/response/task-list');
  }

  verifyResponsePageContent(): void {
    I.see('Respond to a money claim');
  }
}
