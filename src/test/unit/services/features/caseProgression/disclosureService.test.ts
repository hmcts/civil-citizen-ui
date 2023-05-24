import {Claim} from 'models/claim';
import {getDisclosureContent} from 'services/features/caseProgression/disclosureService';

describe('Disclosure service', () => {
  const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  const caseData = Object.assign(claim, mockClaim.case_data);

  it('should return both disclosure document and disclosure list content', () => {
    //when
    const actualDisclosureContent = getDisclosureContent(mockClaimId, caseData);

    //Then
    expect(actualDisclosureContent.length).toEqual(2);
    expect(actualDisclosureContent[0].contentSections.length).toEqual(4);
    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS');
    expect(actualDisclosureContent[1].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[1].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST');
  });
});
