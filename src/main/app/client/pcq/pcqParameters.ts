export interface PcqParameters {
  pcqId: string;
  serviceId: string;
  actor: string;
  partyId: string;
  returnUrl: string;
  ccdCaseId?: string;
  language?: string;
}

export interface EncryptedPcqParams extends PcqParameters {
  token: string;
}
