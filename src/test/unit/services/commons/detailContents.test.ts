import {getWhatIsDisclosureDetailContent} from 'services/commons/detailContents';
import {getWhatIsDisclosureDetailContentMock} from '../../../utils/mocks/detailContentMock';

describe('Detail service', () => {
  it('should get detail components correctly', async () => {
    //Given
    const whatIsDisclosureDetailsContentExpected = getWhatIsDisclosureDetailContentMock();

    //When
    const whatIsDisclosureDetailsContentResult = getWhatIsDisclosureDetailContent();

    //Then
    expect(whatIsDisclosureDetailsContentExpected).toStrictEqual(whatIsDisclosureDetailsContentResult);
  });
});

