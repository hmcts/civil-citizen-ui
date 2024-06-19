import {t} from 'i18next';
import {
  applyingToCourtAsCreditor,
  bsCreditorsResponsibilities,
  bsGuidanceForCreditors,
  findCourtTribunalUrl,
} from 'common/utils/externalURLs';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const getBSGuidanceContent = (lng: string) => {
  const howToContactSection = t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.HOW_TO_CONTACT_PARA3', { lng });
  const bsGuidanceScheme = t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO_PARA2', {lng});
  const linkForContactYourLocalCourt = `<a href="${findCourtTribunalUrl}" target="_blank">${t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.CONTACT_LOCAL_COURT_LINK', { lng })}</a>`;
  const linkBSGuidanceForCreditors = `<a href="${bsGuidanceForCreditors}" target="_blank">${t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.DEBT_RESPITE_GUIDANCE_SCHEME_LINK', { lng })}</a>`;
  const mailTo = 'mailto:contactocmc@justice.gov.uk';
  return new PageSectionBuilder()
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.PAGE_TITLE')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.SUMMARY')
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_1')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_2')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_3')
    .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_1', { lng })}</li>
              <li>${t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_2', { lng })}</li>
              <li>${t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_3', { lng })}</li>
              <li>${t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.REASON_4', { lng })}</li>
            </ul>`)
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_4')
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.HOW_TO_CONTACT')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.HOW_TO_CONTACT_PARA1')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.EMAIL_ID', mailTo, 'PAGES.LATEST_UPDATE_CONTENT.EMAIL')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.POST')
    .addRawHtml(`<p class="govuk-body">${howToContactSection.replace('LINK_TO_CONTACT_YOUR_LOCAL_COURT', linkForContactYourLocalCourt)}</p>`)
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS_PARA1')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS_PARA2')
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO_PARA1')
    .addRawHtml(`<p class="govuk-body">${bsGuidanceScheme.replace('DEBT_RESPITE_GUIDANCE_SCHEME_LINK', linkBSGuidanceForCreditors)}</p>`)
    .build();
};

export const getSupportLinks = (lng: string) => {
  const iWantToTitle = t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.LINK_TITLE', { lng });
  const changeText = t('PAGES.DASHBOARD.SUPPORT_LINKS.DEBT_RESPITE_SCHEME',  {lng});
  const iWantToLinks = [];
  iWantToLinks.push({ text: changeText.replace('CH1', ':'), url: bsCreditorsResponsibilities , translated:true});
  iWantToLinks.push({ text: 'PAGES.DASHBOARD.SUPPORT_LINKS.APPLYING_TO_COURT_AS_A_CREDITOR', url: applyingToCourtAsCreditor });
  return [iWantToTitle, iWantToLinks] as const;
};
