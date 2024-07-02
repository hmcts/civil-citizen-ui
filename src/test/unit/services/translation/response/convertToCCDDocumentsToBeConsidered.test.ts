import {Claim} from 'common/models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {convertToCCDDocumentsToBeConsidered} from 'services/translation/response/convertToCCDDocumentsToBeConsidered';
import {CCDDocumentsToBeConsidered} from 'models/ccdResponse/ccdDocumentsToBeConsidered';

describe('translate minti documents to be considered to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();

  it('should return undefined if documents to be considered doesnt exist', () => {
    const claimEmpty = new Claim();
    claim.directionsQuestionnaire = new DirectionQuestionnaire();
    const ccdClaim = convertToCCDDocumentsToBeConsidered(claimEmpty.directionQuestionnaire?.hearing);
    expect(ccdClaim).toBe(undefined);
  });

  it('should documents to be considered to CCD when YES', () => {
    claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {
      option: YesNo.YES,
    };
    claim.directionQuestionnaire.hearing.documentsConsideredDetails = 'details';
    const ccdClaim = convertToCCDDocumentsToBeConsidered(claim.directionQuestionnaire?.hearing);

    const expected: CCDDocumentsToBeConsidered = {
      hasDocumentsToBeConsidered: YesNoUpperCamelCase.YES,
      details: 'details',
    };
    expect(ccdClaim).toMatchObject(expected);
  });

  it('should documents to be considered to CCD when NO', () => {
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.hearing = new Hearing();

    claim.directionQuestionnaire.hearing.hasDocumentsToBeConsidered = {
      option: YesNo.NO,
    };
    const ccdClaim = convertToCCDDocumentsToBeConsidered(claim.directionQuestionnaire?.hearing);

    const expected: CCDDocumentsToBeConsidered = {
      hasDocumentsToBeConsidered: YesNoUpperCamelCase.NO,
      details: undefined,
    };
    expect(ccdClaim).toMatchObject(expected);
  });

});
