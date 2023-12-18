import {CaseState} from 'form/models/claimDetails';
import {getHasAnythingChanged} from 'services/features/caseProgression/trialArrangements/hasAnythingChanged';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {DocumentType} from 'models/document/documentType';
import {CaseRole} from 'form/models/caseRoles';

describe('hasAnythingChanged', () => {
  let mockClaim;
  let claimContent: { case_data: { caseProgression: { hasAnythingChanged: [YesNo, string]; }, caseRole: CaseRole.DEFENDANT }; };

  beforeEach(() => {
    mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
    claimContent = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          hasAnythingChanged: [
            {},
          ],
        },
      },
    };
  });

  it('should return all the content', () => {
    //Given
    claimContent.case_data.caseProgression.hasAnythingChanged = [YesNo.YES,'some text'];
    const claim =  Object.assign(new Claim(), claimContent);

    //when
    const actualIsCaseReadyContent = getHasAnythingChanged(claim.id.toString(), claim);

    //Then
    expect(actualIsCaseReadyContent[0].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.FINALISE');
    expect(actualIsCaseReadyContent[1].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.CLAIM_NUMBER');
    expect(actualIsCaseReadyContent[2].data.text).toEqual('COMMON.PARTIES');
    expect(actualIsCaseReadyContent[3].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.HAS_ANYTHING');
    expect(actualIsCaseReadyContent[4].data.text).toEqual('PAGES.HAS_ANYTHING_CHANGED.DIRECTIONS');
    expect(actualIsCaseReadyContent[4].data.textBefore).toEqual('PAGES.HAS_ANYTHING_CHANGED.YOU_CAN');
  });

  it('should create the correct link to "directions questionnaire" if defendant document exists', () => {
    //Given
    const claim =  Object.assign(new Claim(), claimContent);
    claim.systemGeneratedCaseDocuments = [
      {
        'id': '9e632049-ff29-44a0-bdb7-d71ec1d42e2d',
        'value': {
          'createdBy': 'Civil',
          'documentLink': {
            'document_url': 'http://dm-store:8080/documents/6b55692f-107a-480e-86b7-917bc0dae8ac',
            'document_filename': 'sealed_claim_form_000MC001.pdf',
            'document_binary_url': 'http://dm-store:8080/documents/6b55692f-107a-480e-86b7-917bc0dae8ac/binary',
          },
          'documentName': 'defendant_claim_form_000MC001.pdf',
          'documentSize': 45794,
          'documentType': DocumentType.DIRECTIONS_QUESTIONNAIRE,
          'createdDatetime': new Date('2022-06-21T14:15:19'),
        },
      }];

    //when
    const actualIsCaseReadyContent = getHasAnythingChanged(claim.id.toString(), claim);

    //Then
    expect(actualIsCaseReadyContent[4].data.href).toEqual('/case/1645882162449409/documents/6b55692f-107a-480e-86b7-917bc0dae8ac');
  });

  it('should create the correct link to "directions questionnaire" if claimant document exists', () => {
    //Given
    const claim =  Object.assign(new Claim(), claimContent);
    claim.caseRole = CaseRole.CLAIMANT;
    claim.systemGeneratedCaseDocuments = [
      {
        'id': '9e632049-ff29-44a0-bdb7-d71ec1d42e2d',
        'value': {
          'createdBy': 'Civil',
          'documentLink': {
            'document_url': 'http://dm-store:8080/documents/6b55692f-107a-480e-86b7-917bc0dae8ac',
            'document_filename': 'sealed_claim_form_000MC001.pdf',
            'document_binary_url': 'http://dm-store:8080/documents/6b55692f-107a-480e-86b7-917bc0dae8ac/binary',
          },
          'documentName': 'claimant_claim_form_000MC001.pdf',
          'documentSize': 45794,
          'documentType': DocumentType.DIRECTIONS_QUESTIONNAIRE,
          'createdDatetime': new Date('2022-06-21T14:15:19'),
        },
      }];

    //when
    const actualIsCaseReadyContent = getHasAnythingChanged(claim.id.toString(), claim);

    //Then
    expect(actualIsCaseReadyContent[4].data.href).toEqual('/case/1645882162449409/documents/6b55692f-107a-480e-86b7-917bc0dae8ac');
  });

  it('should create the correct link to "directions questionnaire" if document does not exist', () => {
    //Given
    const claim =  Object.assign(new Claim(), claimContent);

    //when
    const actualIsCaseReadyContent = getHasAnythingChanged(claim.id.toString(), claim);

    //Then
    expect(actualIsCaseReadyContent[4].data.href).toEqual('/case/1645882162449409/documents/undefined');
  });
});
