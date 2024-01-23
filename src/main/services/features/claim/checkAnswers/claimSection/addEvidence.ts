import {SummarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {CLAIM_EVIDENCE_URL} from '../../../../../routes/urls';
import {EvidenceItem} from '../../../../../common/form/models/evidence/evidenceItem';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const addEvidence = (claim: Claim, claimSection: SummarySection, claimId: string, lang: string | unknown) => {
  if (claim.claimDetails?.evidence) {
    claimSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EVIDENCE_TITLE', {lang}), '', CLAIM_EVIDENCE_URL, changeLabel(lang)),
    );
    const evidence: EvidenceItem[] = claim.claimDetails.evidence.evidenceItem;
    for (let i = 0; i < evidence.length; i++) {
      claimSection.summaryList.rows.push(
        summaryRow(evidence[i].type, evidence[i].description, CLAIM_EVIDENCE_URL, changeLabel(lang)),
      );
    }
  }
};
