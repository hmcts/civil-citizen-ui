import {
  getWhatIsDifferenceDisclosureDocumentsContent,
  getHowToAgreeDisclosureOfElectronicDocumentsContent,
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

  it('should get How To Agree Disclosure Of ElectronicDocuments correctly', async () => {
    //Given
    const whatIsDisclosureDetailsContentExpected = getHowToAgreeDisclosureOfElectronicDocumentsContent();

    //When
    const whatIsDisclosureDetailsContentResult = getHowToAgreeDisclosureOfElectronicDocumentsContent();

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

