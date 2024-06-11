import {
  getWhatIsDifferenceDisclosureDocumentsContent,
  getWhatIsDisclosureDetailContent,
} from 'services/commons/detailContents';
import {
  getWhatIsDifferenceDisclosureDocumentsContentMock,
  getWhatIsDisclosureDetailContentMock,
} from '../../../utils/mocks/detailContentMock';

describe('Detail service', () => {
  it('should get detail components correctly', async () => {
    //Given
    const whatIsDisclosureDetailsContentExpected = getWhatIsDisclosureDetailContentMock();

    //When
    const whatIsDisclosureDetailsContentResult = getWhatIsDisclosureDetailContent();

    //Then
    expect(whatIsDisclosureDetailsContentExpected).toStrictEqual(whatIsDisclosureDetailsContentResult);
  });

  it('should get detail components correctly', async () => {
    //Given
    const whatIsDifferenceExpected = getWhatIsDifferenceDisclosureDocumentsContentMock();

    //When
    const whatIsDifferenceResult = getWhatIsDifferenceDisclosureDocumentsContent();

    //Then
    expect(whatIsDifferenceExpected).toStrictEqual(whatIsDifferenceResult);
  });
});

