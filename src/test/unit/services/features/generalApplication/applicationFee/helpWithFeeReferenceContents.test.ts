import {
  getHelpWithApplicationFeeReferenceContents, getButtonsContents,
} from 'services/features/generalApplication/applicationFee/helpWithFeeReferenceContents';

describe('Help with Application fee content', () => {
  it('should return all the content for getHelpWithApplicationFeeContinueContent', () => {
    //When
    const actualContent = getHelpWithApplicationFeeReferenceContents();
    //Then
    expect(actualContent[0].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING');
    expect(actualContent[1].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE');
    expect(actualContent[2].data.text).toEqual('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.REFERENCE_NUMBER.TITLE');
  });

  it('should return all the content for getHelpWithApplicationFeeContinueContent', () => {
    //When
    const actualContent = getButtonsContents('123');
    //Then
    expect(actualContent[0].data.text).toEqual('COMMON.BUTTONS.CONTINUE');
  });
});
