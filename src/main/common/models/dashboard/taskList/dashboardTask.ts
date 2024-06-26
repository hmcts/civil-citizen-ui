export class DashboardTask {
  id: string;
  taskNameEn: string;
  taskNameCy: string;
  statusEn: string;
  statusCy: string;
  statusColour: string;
  hintTextEn: string;
  hintTextCy: string;

  constructor(id: string, taskNameEn?: string, taskNameCy?: string, statusEn?: string,
    statusCy?: string, statusColour?: string, hintTextEn?: string, hintTextCy?: string) {

    this.id = id;
    this.taskNameEn = taskNameEn;
    this.taskNameCy = taskNameCy;
    this.statusEn = statusEn;
    this.statusCy = statusCy;
    this.statusColour = statusColour;
    this.hintTextEn = hintTextEn;
    this.hintTextCy = hintTextCy;

  }
}

