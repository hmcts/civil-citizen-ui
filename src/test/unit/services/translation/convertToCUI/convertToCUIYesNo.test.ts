import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  toCUIBoolean, toCUIBooleanString, toCUIGenericYesNo, toCUIYesNo,
} from 'services/translation/convertToCUI/convertToCUIYesNo';

describe('CCD Yes/No translation', () => {
  it.each<[YesNoUpperCamelCase, YesNo, boolean, string]>([
    [YesNoUpperCamelCase.YES, YesNo.YES, true, 'true'],
    [YesNoUpperCamelCase.NO, YesNo.NO, false, 'false'],
  ])('translates %s consistently across the four public adapters', (source, option, bool, text) => {
    expect(toCUIGenericYesNo(source)).toEqual(new GenericYesNo(option));
    expect(toCUIYesNo(source)).toBe(option);
    expect(toCUIBoolean(source)).toBe(bool);
    expect(toCUIBooleanString(source)).toBe(text);
  });

  it.each([undefined, null])('keeps missing %p distinct from an explicit No', value => {
    expect(toCUIGenericYesNo(value)).toBeUndefined();
    expect(toCUIYesNo(value)).toBeUndefined();
    expect(toCUIBoolean(value)).toBeUndefined();
    expect(toCUIBooleanString(value)).toBeUndefined();
  });

  it('returns independent editable forms for different translated answers', () => {
    const first = toCUIGenericYesNo(YesNoUpperCamelCase.YES);
    const second = toCUIGenericYesNo(YesNoUpperCamelCase.YES);
    first.option = YesNo.NO;
    expect(second.option).toBe(YesNo.YES);
  });
});
