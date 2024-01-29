import {SummarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {CLAIM_EVIDENCE_URL} from 'routes/urls';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const addEvidence = (claim: Claim, claimSection: SummarySection, claimId: string, lng: string) => {
  if (claim.claimDetails?.evidence) {
    claimSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE', {lng}), '', CLAIM_EVIDENCE_URL, changeLabel(lng)),
    );
    const evidence: EvidenceItem[] = claim.claimDetails.evidence.evidenceItem;
    for (const element of evidence) {
      claimSection.summaryList.rows.push(
        summaryRow(element.type, element.description, CLAIM_EVIDENCE_URL, changeLabel(lng)),
      );
    }
  }
};
