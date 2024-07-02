import {t} from 'i18next';
import {
  getHelpApplicationFeeSelectionPageContents,
  getButtonsContents, getApplicationFeeContentPageDetails,
  getHelpApplicationFeeContinuePageContents,
} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

describe('Help with Application fee content', () => {
  it('should return getHelpApplicationFeeSelectionPageContents related content ', () => {
    //Given
    const lng = 'en';
    const linkBefore = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_BEFORE';
    const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">
        ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_TEXT', {lng})}</a></p>`;
    const expectedContent = new PageSectionBuilder()
      .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING')
      .addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.WANT_TO_APPLY_HWF_TITLE')
      .addRawHtml(linkParagraph)
      .addParagraph('')
      .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.PARAGRAPH', {lng}))
      .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.QUESTION_TITLE', {lng}))
      .build();
    //When
    const actualContent = getHelpApplicationFeeSelectionPageContents('en');
    //Then
    expect(expectedContent.flat()).toEqual(actualContent);
  });

  it('should return all the content for getHelpApplicationFeeContinuePageContents', () => {
    //Given
    const gaFeeData = {
      calculatedAmountInPence: 23000,
      code: 'code',
      version: 1,
    };
    //When
    const actualContent = getHelpApplicationFeeContinuePageContents(gaFeeData);
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

  it('should return all the content for getApplicationFeeContentPageDetails', () => {
    //When
    const actualContent = getButtonsContents('123');
    //Then
    expect(actualContent[0].data.text).toEqual('COMMON.BUTTONS.CONTINUE');
  });

  it('should return all the content for getHelpWithApplicationFeeContent', () => {
    //Given
    //When
    const actualContent = getApplicationFeeContentPageDetails('123', 'abc');
    //Then
    expect(actualContent[0].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING');
    expect(actualContent[1].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.TITLE');
    expect(actualContent[2].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_IF');
    expect(actualContent[3].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_INSTEAD');
    expect(actualContent[4].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.APPLICATION_FEE_PARAGRAPH_DURING');
    expect(actualContent[5].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_ONCE');
    expect(actualContent[6].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.LINK');
    expect(actualContent[7].data.text).toEqual('COMMON.BUTTONS.CONTINUE');
  });
});
