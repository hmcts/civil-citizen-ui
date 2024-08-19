export class DefendantLinkStatus {
  isOcmcCase: boolean;
  linked: boolean;

  constructor(isOcmcCase: boolean, linked: boolean) {
    this.isOcmcCase = isOcmcCase;
    this.linked = linked;
  }
}
