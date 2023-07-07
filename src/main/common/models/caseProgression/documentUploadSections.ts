import {SummarySections} from 'models/summaryList/summarySections';

export interface documentUploadSections {
  witnessEvidenceSection: SummarySections,
  disclosureSection: SummarySections,
  expertEvidenceSection: SummarySections,
  trialDocuments: SummarySections,
  hearingDocuments: SummarySections
}
