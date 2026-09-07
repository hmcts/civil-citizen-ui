import {validateSync} from 'class-validator';
import {
  ApplicationType,
  ApplicationTypeOption,
  assertValidApplicationTypes,
  getOtherApplicationTypeOptions,
  getPersistableApplicationTypeOptions,
} from 'models/generalApplication/applicationType';

describe('ApplicationType', () => {
  it.each(getPersistableApplicationTypeOptions())('validates persistable GA application type %s', (applicationTypeOption) => {
    const errors = validateSync(new ApplicationType(applicationTypeOption), {forbidUnknownValues: false});

    expect(errors).toHaveLength(0);
  });

  it.each([
    ApplicationTypeOption.OTHER_OPTION,
    'SUMMARY_JUDGMENT',
    'Summary judgment',
    'Other option',
    '',
    'ARBITRARY_VALUE',
    undefined,
  ])('rejects non-persistable GA application type %s', (applicationTypeOption) => {
    const errors = validateSync(new ApplicationType(applicationTypeOption as ApplicationTypeOption), {forbidUnknownValues: false});

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual(expect.objectContaining({
      isIn: 'ERRORS.APPLICATION_TYPE_REQUIRED',
    }));
  });

  it('keeps OTHER_OPTION out of persistable and nested other values', () => {
    expect(getPersistableApplicationTypeOptions()).not.toContain(ApplicationTypeOption.OTHER_OPTION);
    expect(getOtherApplicationTypeOptions()).toEqual([
      ApplicationTypeOption.AMEND_A_STMT_OF_CASE,
      ApplicationTypeOption.SUMMARY_JUDGEMENT,
      ApplicationTypeOption.STRIKE_OUT,
      ApplicationTypeOption.STAY_THE_CLAIM,
      ApplicationTypeOption.UNLESS_ORDER,
      ApplicationTypeOption.SETTLE_BY_CONSENT,
      ApplicationTypeOption.OTHER,
    ]);
  });

  it.each<[ApplicationType[] | undefined]>([
    [undefined],
    [[]],
  ])('rejects missing GA application type collection %s', (applicationTypes) => {
    expect(() => assertValidApplicationTypes(applicationTypes)).toThrow('Invalid general application type selected');
  });
});
