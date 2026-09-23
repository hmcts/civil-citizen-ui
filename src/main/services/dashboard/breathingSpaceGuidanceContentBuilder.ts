import {t} from 'i18next';
import {
  applyingToCourtAsCreditor,
  bsCreditorsResponsibilities,
  bsGuidanceForCreditors,
} from 'common/utils/externalURLs';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const getBSGuidanceContent = (lng: string, _qmContactLink: string, _isQMLipEnabled = false) => {
  const bsGuidanceScheme = t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO_PARA2', {lng});
  const linkBSGuidanceForCreditors = `<a href="${bsGuidanceForCreditors}" target="_blank">${t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.DEBT_RESPITE_GUIDANCE_SCHEME_LINK', { lng })}</a>`;
  const content =  new PageSectionBuilder()
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.PAGE_TITLE')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.SUMMARY')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_1')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_NEXT_PARAGRAPH_2')
    .addStartButton('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.ENTER_BREATHING_SPACE_DETAILS', '#')
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS_PARA1')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHAT_HAPPENS_DURING_BS_PARA2')
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHEN_BS_ENDS')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHEN_BS_ENDS_PARA1')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.WHEN_BS_ENDS_PARA2')
    .addTitle('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO')
    .addParagraph('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.MORE_INFO_PARA1')
    .addRawHtml(`<p class="govuk-body">${bsGuidanceScheme.replace('DEBT_RESPITE_GUIDANCE_SCHEME_LINK', linkBSGuidanceForCreditors)}</p>`);

  return content.build();
};

export const getSupportLinks = (lng: string) => {
  const iWantToTitle = t('PAGES.INFORM_THE_COURT_OF_A_BREATHING_SPACE.LINK_TITLE', { lng });
  const changeText = t('PAGES.DASHBOARD.SUPPORT_LINKS.DEBT_RESPITE_SCHEME',  {lng});
  const iWantToLinks = [];
  iWantToLinks.push({ text: changeText.replace('CH1', ':'), url: bsCreditorsResponsibilities , translated:true});
  iWantToLinks.push({ text: 'PAGES.DASHBOARD.SUPPORT_LINKS.APPLYING_TO_COURT_AS_A_CREDITOR', url: applyingToCourtAsCreditor });
  return [iWantToTitle, iWantToLinks] as const;
};
