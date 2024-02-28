import {SummarySections} from 'models/summaryList/summarySections';

export interface DocumentUploadSections {
  witnessEvidenceSection: SummarySections,
  disclosureEvidenceSection: SummarySections,
  expertEvidenceSection: SummarySections,
  trialEvidenceSection: SummarySections,
}
