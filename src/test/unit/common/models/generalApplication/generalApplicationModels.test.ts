import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {GeneralApplication, toGeneralApplication} from 'models/generalApplication/GeneralApplication';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {UploadN245GAFiles} from 'models/generalApplication/uploadN245GAFiles';

describe('General application models', () => {
  it('hydrates stored general application data onto the model defaults', () => {
    const storedGeneralApplication = {
      applicationTypes: [new ApplicationType(ApplicationTypeOption.VARY_ORDER)],
    };

    const result = toGeneralApplication(storedGeneralApplication);

    expect(result).toBeInstanceOf(GeneralApplication);
    expect(result.applicationTypes).toEqual(storedGeneralApplication.applicationTypes);
    expect(result.requestingReasons).toEqual([]);
    expect(result.orderJudges).toEqual([]);
    expect(result.uploadEvidenceForApplication).toEqual([]);
    expect(result.uploadAdditionalDocuments).toEqual([]);
  });

  it('creates an empty upload N245 model without a source file model', () => {
    const result = new UploadN245GAFiles();

    expect(result.fileUpload).toBeUndefined();
    expect(result.caseDocument).toBeUndefined();
  });

  it('creates empty hearing support when no selected support is supplied', () => {
    const result = new HearingSupport();

    expect(result.stepFreeAccess.selected).toBe(false);
    expect(result.hearingLoop.selected).toBe(false);
    expect(result.signLanguageInterpreter.sourceName).toBe(SupportType.SIGN_LANGUAGE_INTERPRETER);
    expect(result.languageInterpreter.sourceName).toBe(SupportType.LANGUAGE_INTERPRETER);
    expect(result.otherSupport.sourceName).toBe(SupportType.OTHER_SUPPORT);
  });
});
