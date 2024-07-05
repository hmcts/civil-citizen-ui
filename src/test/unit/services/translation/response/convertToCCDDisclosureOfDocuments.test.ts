import {Claim} from 'common/models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  toCCDDisclosureOfElectronicDocuments,
  toCCDDisclosureOfNonElectronicDocuments,
} from 'services/translation/response/convertToCCDDisclosureOfDocuments';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument,
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';
import {CCDDisclosureOfElectronicDocuments} from 'models/ccdResponse/ccdDisclosureOfElectronicDocuments';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDDisclosureOfNonElectronicDocuments} from 'models/ccdResponse/ccdDisclosureOfNonElectronicDocuments';

describe('translate minti disclosure of documents to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();

  it('should return undefined if disclosure of documents doesnt exist', () => {
    const claimEmpty = new Claim();
    claim.directionsQuestionnaire = new DirectionQuestionnaire();
    const ccdClaim = toCCDDisclosureOfElectronicDocuments(claimEmpty.directionQuestionnaire?.hearing);
    expect(ccdClaim).toBe(undefined);
  });

  it('should translate electronic documents to CCD', () => {
    claim.directionQuestionnaire.hearing.disclosureOfDocuments = new DisclosureOfDocuments();
    claim.directionQuestionnaire.hearing.disclosureOfDocuments.documentsTypeChosen = [TypeOfDisclosureDocument.ELECTRONIC];
    claim.directionQuestionnaire.hearing.hasAnAgreementBeenReached = HasAnAgreementBeenReachedOptions.NO_BUT_AN_AGREEMENT_IS_LIKELY;
    claim.directionQuestionnaire.hearing.disclosureOfElectronicDocumentsIssues = 'issues';
    const ccdClaim = toCCDDisclosureOfElectronicDocuments(claim.directionQuestionnaire?.hearing);

    const expected: CCDDisclosureOfElectronicDocuments = {
      reachedAgreement: YesNoUpperCamelCase.NO,
      agreementLikely: YesNoUpperCamelCase.YES,
      reasonForNoAgreement: 'issues',
    };
    expect(ccdClaim).toMatchObject(expected);
  });

  it('should translate non-electronic documents to CCD', () => {
    claim.directionQuestionnaire.hearing.disclosureOfDocuments = new DisclosureOfDocuments();
    claim.directionQuestionnaire.hearing.disclosureOfDocuments.documentsTypeChosen = [TypeOfDisclosureDocument.NON_ELECTRONIC];
    claim.directionQuestionnaire.hearing.disclosureNonElectronicDocument = 'directions';
    const ccdClaim = toCCDDisclosureOfNonElectronicDocuments(claim.directionQuestionnaire?.hearing);

    const expected: CCDDisclosureOfNonElectronicDocuments = {
      bespokeDirections: 'directions',
    };
    expect(ccdClaim).toMatchObject(expected);
  });
});
