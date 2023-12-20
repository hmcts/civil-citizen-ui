import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';

export const getMediationCarmParagraph = (lang: string, isClaimantReject = false): ClaimSummarySection[] => {
  return new PageSectionBuilder()
    .addParagraph(isClaimantReject? t('PAGES.SUBMIT_CONFIRMATION.CLAIMANT_REJECTS_MEDIATION', {lng: lang}) : t('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION1', {lng: lang}))
    .addParagraph(t('PAGES.SUBMIT_CONFIRMATION.WE_WILL_MEDIATION2', {lng: lang}))
    .build();
};
