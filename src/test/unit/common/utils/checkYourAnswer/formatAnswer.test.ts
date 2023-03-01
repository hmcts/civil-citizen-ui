import {getFormattedAnswerForYesNoNotReceived} from 'common/utils/checkYourAnswer/formatAnswer';
import {YesNo, YesNoNotReceived} from 'form/models/yesNo';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
describe('getFormattedAnswerForYesNoNotReceived', ()=>{
  it('should return common yes when answer is yes', ()=> {
    //When
    const result = getFormattedAnswerForYesNoNotReceived(YesNo.YES, 'en');
    //Then
    expect(result).toEqual('COMMON.YES');
  });
  it('should return common no when answer is no', () =>{
    //When
    const result = getFormattedAnswerForYesNoNotReceived(YesNo.NO, 'en');
    //Then
    expect(result).toEqual('COMMON.NO');
  });
  it('should return option not received when answer is not received', () =>{
    //When
    const result = getFormattedAnswerForYesNoNotReceived(YesNoNotReceived.NOT_RECEIVED, 'en');
    //Then
    expect(result).toEqual('PAGES.SENT_EXPERT_REPORTS.OPTION_NOT_RECEIVED');
  });
  it('should return empty string when no answer is provided', () => {
    //When
    const result = getFormattedAnswerForYesNoNotReceived(undefined, 'en');
    //Then
    expect(result).toEqual('');
  });
});
