import {CCDClaim} from 'models/civilClaimResponse';
import {TrialArrangements, TrialArrangementsDocument} from 'models/caseProgression/trialArrangements/trialArrangements';
import {DocumentType} from 'models/document/documentType';
import {toCUITrialArrangements} from 'services/translation/convertToCUI/convertToCUITrialArrangements';
import {CaseRole} from 'form/models/caseRoles';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';

describe('toCUITrialArrangements', () => {
  it ('should convert CCDClaim to TrialArrangements for claimant', () => {
    //Given
    const isClaimant = true;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [getTrialReadyDocument(true), getTrialReadyDocument(false)],
    };
    const expectedOutput: TrialArrangements = new TrialArrangements();
    expectedOutput.trialArrangementsDocument = getTrialReadyDocument(isClaimant);
    //When
    const actualOutput = toCUITrialArrangements(ccdClaim, isClaimant);
    //Then
    expect(actualOutput).toEqual(expectedOutput);
  });

  it ('should convert CCDClaim to TrialArrangements for defendant', () => {
    //Given
    const isClaimant = false;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [getTrialReadyDocument(true), getTrialReadyDocument(false)],
    };
    const expectedOutput: TrialArrangements = new TrialArrangements();
    expectedOutput.trialArrangementsDocument = getTrialReadyDocument(isClaimant);
    expectedOutput.hasAnythingChanged = new HasAnythingChangedForm(undefined, undefined);
    expectedOutput.isCaseReady = undefined;
    expectedOutput.otherTrialInformation = undefined;
    //When
    const actualOutput = toCUITrialArrangements(ccdClaim, isClaimant);
    //Then
    expect(actualOutput).toEqual(expectedOutput);
  });

  it ('should return undefined if CCDClaim does not have trial ready document for claimant', () => {
    //Given
    const isClaimant = true;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [getTrialReadyDocument(false)],
    };
    const expectedOutput: TrialArrangements = undefined;
    //When
    const actualOutput = toCUITrialArrangements(ccdClaim, isClaimant);
    //Then
    expect(actualOutput).toEqual(expectedOutput);
  });

  it ('should convert CCDClaim to TrialArrangements without trialArrangementsDocument if CCDClaim does not have trial ready document for defendant', () => {
    //Given
    const isClaimant = false;
    const ccdClaim: CCDClaim = {
      trialReadyDocuments: [getTrialReadyDocument(true)],
    };
    const expectedOutput: TrialArrangements = new TrialArrangements();
    expectedOutput.hasAnythingChanged = new HasAnythingChangedForm(undefined, undefined);
    expectedOutput.isCaseReady = undefined;
    expectedOutput.otherTrialInformation = undefined;
    //When
    const actualOutput = toCUITrialArrangements(ccdClaim, isClaimant);
    //Then
    expect(actualOutput).toEqual(expectedOutput);
  });
});

function getTrialReadyDocument(isClaimant: boolean): TrialArrangementsDocument {
  if (isClaimant) {
    const claimantTrialArrangementsDocument = new TrialArrangementsDocument();
    claimantTrialArrangementsDocument.id = '1234';
    claimantTrialArrangementsDocument.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5',
        'document_filename': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5/binary',
      },
      'documentName': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
      'documentSize': 56461,
      documentType: DocumentType.TRIAL_READY_DOCUMENT,
      createdDatetime: new Date('2022-06-21T14:15:19'),
      ownedBy: CaseRole.CLAIMANT,
    };
    return claimantTrialArrangementsDocument;
  } else {
    const defendantTrialArrangementsDocument = new TrialArrangementsDocument();
    defendantTrialArrangementsDocument.id = '2345';
    defendantTrialArrangementsDocument.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2',
        'document_filename': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2/binary',
      },
      'documentName': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
      'documentSize': 56461,
      documentType: DocumentType.TRIAL_READY_DOCUMENT,
      createdDatetime: new Date('2022-06-21T14:15:19'),
      ownedBy: CaseRole.DEFENDANT,
    };
    return defendantTrialArrangementsDocument;
  }
}
