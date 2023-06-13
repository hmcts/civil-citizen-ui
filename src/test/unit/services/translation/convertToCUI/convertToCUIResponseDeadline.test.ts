import {toCUIResponseDeadline} from 'services/translation/convertToCUI/convertToCUIResponseDeadline';
import {ResponseDeadline} from 'models/responseDeadline';
import {ResponseOptions} from 'form/models/responseDeadline';

describe('translate respondentSolicitor1AgreedDeadlineExtension to CUI ResponseDeadline model', () => {

  it('should return undefined if respondentSolicitor1AgreedDeadlineExtension doesnt exist', () => {
    //Given
    const deadlineCCDEmpty: Date = undefined;
    //When
    const deadlineResponseDate = toCUIResponseDeadline(deadlineCCDEmpty);
    //Then
    expect(deadlineResponseDate).toBe(undefined);
  });

  it('should translate respondentSolicitor1AgreedDeadlineExtension to CUI', () => {
    const deadlineDate: Date = new Date(2023, 2, 20);
    const deadlineResponseDate: ResponseDeadline = {
      calculatedResponseDeadline: deadlineDate,
      agreedResponseDeadline: deadlineDate,
      option: ResponseOptions.ALREADY_AGREED,
    };
    //Given
    const deadlineCCD: Date = new Date(2023, 2, 20);
    //When
    const cuiResponseDeadline = toCUIResponseDeadline(deadlineCCD);
    //Then
    expect(cuiResponseDeadline).toMatchObject(deadlineResponseDate);
  });
});
