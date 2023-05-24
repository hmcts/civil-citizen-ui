import {Claim} from 'models/claim';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {buildWitnessSection} from 'services/features/caseProgression/witnessContentBuilder';

describe('Latest Update Content service', () => {
  const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const caseData = Object.assign(claim, mockClaim.case_data);
  const actualLatestWitnessContent = getWitnessContent(caseData);
  it('should return witness section content', () => {
    //when
    const witnessSection = buildWitnessSection(caseData);
    const witnessContent = [witnessSection];
    const filteredWitnessContent = witnessContent.filter(sectionContent => sectionContent.length);
    let formattedWitnessContent=[];
    formattedWitnessContent = filteredWitnessContent.map((sectionContent, index) => {
      return ({
        contentSections: sectionContent,
        hasDivider: index < formattedWitnessContent.length - 1,
      });
    });
    //Then
    expect(actualLatestWitnessContent).toMatchObject(formattedWitnessContent);
    expect(actualLatestWitnessContent[0].contentSections).toEqual(filteredWitnessContent[0]);
    expect(actualLatestWitnessContent[0].contentSections.length).toEqual(filteredWitnessContent[0].length);
  });
});
