import {t} from 'i18next';
import {
  getHelpAdditionalFeeSelectionPageContents,
  getButtonsContents,
} from 'services/features/generalApplication/additionalFee/helpWithAdditionalFeeContent';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

describe('Help with Additional fee content', () => {
  it('should return getHelpAdditionalFeeSelectionPageContents related content ', () => {
    //Given
    const lng = 'en';
    const linkBefore = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_BEFORE';
    const linkParagraph = `<p class="govuk-body">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">
        ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_TEXT', {lng})}</a>.</p>`;
    const expectedContent = new PageSectionBuilder()
      .addMicroText('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING')
      .addMainTitle('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.WANT_TO_APPLY_HWF_TITLE')
      .addRawHtml(linkParagraph)
      .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.PARAGRAPH', {lng}))
      .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.QUESTION_TITLE', {lng}))
      .build();
    //When
    const actualContent = getHelpAdditionalFeeSelectionPageContents('en');
    //Then
    expect(expectedContent.flat()).toEqual(actualContent);
  });

  it('should return all the content for getApplicationFeeContentPageDetails', () => {
    //When
    const actualContent = getButtonsContents('123');
    //Then
    expect(actualContent[0].data.text).toEqual('COMMON.BUTTONS.CONTINUE');
  });
});
