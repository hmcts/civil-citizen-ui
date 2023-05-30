export enum DocumentType {
  SEALED_CLAIM = 'SEALED_CLAIM',
  ACKNOWLEDGEMENT_OF_CLAIM = 'ACKNOWLEDGEMENT_OF_CLAIM',
  ACKNOWLEDGEMENT_OF_SERVICE = 'ACKNOWLEDGEMENT_OF_SERVICE',
  DIRECTIONS_QUESTIONNAIRE = 'DIRECTIONS_QUESTIONNAIRE',
  DEFENDANT_DEFENCE = 'DEFENDANT_DEFENCE',
  DEFENDANT_DRAFT_DIRECTIONS = 'DEFENDANT_DRAFT_DIRECTIONS',
  DEFAULT_JUDGMENT = 'DEFAULT_JUDGMENT',
  CLAIMANT_DEFENCE = 'CLAIMANT_DEFENCE',
  CLAIMANT_DRAFT_DIRECTIONS = 'CLAIMANT_DRAFT_DIRECTIONS',
  SDO_ORDER = 'SDO_ORDER',
  HEARING_FORM = 'HEARING_FORM'
}

export enum EvidenceUploadWitness {
  YOUR_STATEMENT='YOUR_STATEMENT',
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
