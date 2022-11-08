import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DQ_DEFENDANT_WITNESSES_URL} from 'routes/urls';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {YesNo} from 'common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

const getEmptyStringIfUndefined = (value: string): string => value || '';

const getWitnesses = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow [] => {
  const witnessesHref = constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL);
  const witnesses: OtherWitnessItems[] = claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems;
  const summaryRows: SummaryRow [] = [];

  witnesses.map((item, index, items) => {
    const witnessDetails = t('COMMON.INPUT_LABELS.FIRST_NAME') + ': ' + getEmptyStringIfUndefined(item.firstName) + '<br />' +
                           t('COMMON.INPUT_LABELS.LAST_NAME') + ': ' + getEmptyStringIfUndefined(item.lastName) + '<br />' +
                           t('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS') + ': ' + getEmptyStringIfUndefined(item.email) + '<br />' +
                           t('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER') + ': ' + getEmptyStringIfUndefined(item.telephone) + '<br />' +
                           t('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY') + ': ' + getEmptyStringIfUndefined(item.details);

    summaryRows.push(summaryRow(`${t('PAGES.CHECK_YOUR_ANSWER.WITNESS', {lng: getLng(lang)})} ${index + 1}`, witnessDetails, witnessesHref, changeLabel(lang)));
  });

  return summaryRows;
};

export const buildHearingRequirementSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection =>{
  const numberOfWitnesses = claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems.length;
  const hearingRequirementSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  if(claim.directionQuestionnaire.witnesses.otherWitnesses.option == YesNo.NO) {
    hearingRequirementSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES', {lng: getLng(lang)}), numberOfWitnesses > 0 ? 'Yes' : 'No'));
  } else {
    if(claim.isRejectAllOfClaimDispute() || claim.isPartialAdmission()) {
      if(numberOfWitnesses > 0)
        hearingRequirementSection.summaryList.rows.push(...getWitnesses(claim, claimId, lang));
    }
  }

  return hearingRequirementSection;
};
