import {t} from 'i18next';
import {
  getApplyHelpWithApplicationFeeContents,
  getButtonsContents,
  getHelpWithApplicationFeeContinueContent
} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

describe('Help with Application fee content', () => {
  it('should return getApplyHelpWithApplicationFeeContents related content ', () => {
    //Given
    const lng = 'en';
    const linkBefore = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_BEFORE';
    const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">
        ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_TEXT', {lng})}</a></p>`;
    const expectedContent = new PageSectionBuilder()
      .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING')
      .addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE')
      .addRawHtml(linkParagraph)
      .addParagraph('')
      .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.PARAGRAPH', {lng}))
      .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.QUESTION_TITLE', {lng}))
      .build();
    //When
    const actualContent = getApplyHelpWithApplicationFeeContents('en');
    //Then
    expect(expectedContent.flat()).toEqual(actualContent);
  });

  it('should return all the content for getHelpWithApplicationFeeContinueContent', () => {
    //Given
    const gaFeeData = {
      calculatedAmountInPence: 23000,
      code: 'code',
      version: 1,
    };
    //When
    const actualContent = getHelpWithApplicationFeeContinueContent(gaFeeData);
    //Then
    expect(actualContent[0].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING');
    expect(actualContent[1].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE');
    expect(actualContent[2].data.html).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.GENERAL_APPLICATION_FEE_INSET');
    expect(actualContent[2].data.variables).toEqual({'feeAmount': 230});
    expect(actualContent[3].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY_LINK');
    expect(actualContent[4].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.RECEIVE_DECISION');
    expect(actualContent[5].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY_TITLE');
    expect(actualContent[6].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY');
    expect(actualContent[7].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY_TITLE');
    expect(actualContent[8].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY');
    expect(actualContent[9].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED_TITLE');
    expect(actualContent[10].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED');
    expect(actualContent[11].data.text).toEqual('PAGES.APPLY_HELP_WITH_FEES.START.CONTINUE_APPLICATION');
  });

  it('should return all the content for getHelpWithApplicationFeeContinueContent', () => {
    //When
    const actualContent = getButtonsContents('123');
    //Then
    expect(actualContent[0].data.text).toEqual('COMMON.BUTTONS.CONTINUE');
  });
});
