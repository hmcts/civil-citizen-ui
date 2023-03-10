import {toCCDRespondentLiPResponse} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

describe('convert to respondent LIP response', () => {
  it('return the Respondent LiP Response object', () => {
    // Given
    const claim = new Claim();
    claim.partialAdmission = {
      alreadyPaid: {
        option: 'yes',
      },
      timeline: {
        rows: [],
        comment: 'Timeline comment',
        filterOutEmptyRows() {
          // required by linter
        },
      },
    };
    claim.evidence = {
      comment: 'Evidence commet',
      evidenceItem: [],
    };

    // When
    const result = toCCDRespondentLiPResponse(claim);

    // Then
    expect(result.partialAdmissionAlreadyPaid).toEqual(YesNoUpperCamelCase.YES);
    expect(result.timelineComment).toEqual(claim.partialAdmission.timeline.comment);
    expect(result.evidenceComment).toEqual(claim.evidence.comment);
  });
});
