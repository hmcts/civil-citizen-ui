export enum DocumentType {
  SEALED_CLAIM = 'SEALED_CLAIM',
  ACKNOWLEDGEMENT_OF_CLAIM = 'ACKNOWLEDGEMENT_OF_CLAIM',
  ACKNOWLEDGEMENT_OF_SERVICE = 'ACKNOWLEDGEMENT_OF_SERVICE',
  DIRECTIONS_QUESTIONNAIRE = 'DIRECTIONS_QUESTIONNAIRE',
  DEFENCE_TRANSLATED_DOCUMENT = 'DEFENCE_TRANSLATED_DOCUMENT',
  DEFENDANT_DEFENCE = 'DEFENDANT_DEFENCE',
  DEFENDANT_DRAFT_DIRECTIONS = 'DEFENDANT_DRAFT_DIRECTIONS',
  DEFAULT_JUDGMENT = 'DEFAULT_JUDGMENT',
  CCJ_REQUEST_ADMISSION = 'CCJ_REQUEST_ADMISSION',
  CCJ_REQUEST_DETERMINATION = 'CCJ_REQUEST_DETERMINATION',
  CLAIM_ISSUE_TRANSLATED_DOCUMENT = 'CLAIM_ISSUE_TRANSLATED_DOCUMENT',
  CLAIMANT_DEFENCE = 'CLAIMANT_DEFENCE',
  CLAIMANT_CLAIM_FORM = 'CLAIMANT_CLAIM_FORM',
  CLAIMANT_DRAFT_DIRECTIONS = 'CLAIMANT_DRAFT_DIRECTIONS',
  CLAIMANT_INTENTION_TRANSLATED_DOCUMENT = 'CLAIMANT_INTENTION_TRANSLATED_DOCUMENT',
  SDO_ORDER = 'SDO_ORDER',
  HEARING_FORM = 'HEARING_FORM',
  INTERLOCUTORY_JUDGEMENT = 'INTERLOCUTORY_JUDGEMENT',
  LIP_MANUAL_DETERMINATION = 'LIP_MANUAL_DETERMINATION',
  MEDIATION_AGREEMENT = 'MEDIATION_AGREEMENT',
  TRIAL_READY_DOCUMENT = 'TRIAL_READY_DOCUMENT',
  JUDGE_FINAL_ORDER = 'JUDGE_FINAL_ORDER',
  DRAFT_CLAIM_FORM = 'DRAFT_CLAIM_FORM',
  SETTLEMENT_AGREEMENT = 'SETTLEMENT_AGREEMENT',
  JUDGMENT_BY_ADMISSION_CLAIMANT = 'JUDGMENT_BY_ADMISSION_CLAIMANT',
  JUDGMENT_BY_ADMISSION_DEFENDANT = 'JUDGMENT_BY_ADMISSION_DEFENDANT',
  JUDGMENT_BY_DETERMINATION_CLAIMANT = 'JUDGMENT_BY_DETERMINATION_CLAIMANT',
  JUDGMENT_BY_DETERMINATION_DEFENDANT = 'JUDGMENT_BY_DETERMINATION_DEFENDANT',
  DEFAULT_JUDGMENT_CLAIMANT1 = 'DEFAULT_JUDGMENT_CLAIMANT1',
  DEFAULT_JUDGMENT_DEFENDANT1 = 'DEFAULT_JUDGMENT_DEFENDANT1',
  DEFAULT_JUDGMENT_CLAIMANT2 = 'DEFAULT_JUDGMENT_CLAIMANT2',
  DEFAULT_JUDGMENT_DEFENDANT2 = 'DEFAULT_JUDGMENT_DEFENDANT2',
}
export enum DocumentUri {
  SEALED_CLAIM = 'sealed-claim',
  ACKNOWLEDGEMENT_OF_CLAIM = 'acknowledgement-of-claim',
  ACKNOWLEDGEMENT_OF_SERVICE = 'acknowledgement-of-service',
  DIRECTIONS_QUESTIONNAIRE = 'directions-questionnaire',
  DEFENDANT_DEFENCE = 'defendant-defence',
  DEFENDANT_DRAFT_DIRECTIONS = 'defendant-draft-directions',
  DEFAULT_JUDGMENT = 'default-judgement',
  CLAIMANT_DEFENCE = 'claimant-defence',
  CLAIMANT_DRAFT_DIRECTIONS = 'claimant-draft-directions',
  SDO_ORDER = 'sdo-order',
  HEARING_FORM = 'hearing-form',
  MEDIATION_AGREEMENT = 'mediation_agreement',
  TRIAL_READY_DOCUMENT = 'trial-ready-document',
  JUDGE_FINAL_ORDER = 'JUDGE_FINAL_ORDER',
}

export enum EvidenceUploadWitness {
  WITNESS_STATEMENT='WITNESS_STATEMENT',
  WITNESS_SUMMARY='WITNESS_SUMMARY',
  NOTICE_OF_INTENTION='NOTICE_OF_INTENTION',
  DOCUMENTS_REFERRED='DOCUMENTS_REFERRED'
}
export enum EvidenceUploadDisclosure {
  DISCLOSURE_LIST='DISCLOSURE_LIST',
  DOCUMENTS_FOR_DISCLOSURE='DOCUMENTS_FOR_DISCLOSURE'
}
export enum EvidenceUploadExpert {
  EXPERT_REPORT='EXPERT_REPORT',
  STATEMENT='STATEMENT',
  QUESTIONS_FOR_EXPERTS='QUESTIONS_FOR_EXPERTS',
  ANSWERS_FOR_EXPERTS='ANSWERS_FOR_EXPERTS',
}
export enum EvidenceUploadTrial {
  CASE_SUMMARY='CASE_SUMMARY',
  SKELETON_ARGUMENT='SKELETON_ARGUMENT',
  AUTHORITIES='AUTHORITIES',
  COSTS='COSTS',
  DOCUMENTARY='DOCUMENTARY'
}
