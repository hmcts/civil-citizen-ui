export class BusinessProcess {
  camundaEvent?: string;
  status?: string;

  hasBusinessProcessFinished() {
    return this.status === 'FINISHED';
  }
}
