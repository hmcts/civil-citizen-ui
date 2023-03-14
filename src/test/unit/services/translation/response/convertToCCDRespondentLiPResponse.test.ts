import {toCCDRespondentLiPResponse} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

describe('convert to respondent LIP response', () => {
  it('return the Respondent LiP Response object', () => {
    // Given
    const claim = new Claim();
    const timeline: DefendantTimeline = new DefendantTimeline([new TimelineRow('6 November 2022', 'Event 1')]);

    claim.partialAdmission = {
      alreadyPaid: {
        option: 'yes',
      },
      timeline: timeline,
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
