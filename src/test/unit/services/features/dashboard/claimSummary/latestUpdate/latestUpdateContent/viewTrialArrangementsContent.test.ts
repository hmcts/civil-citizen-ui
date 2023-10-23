import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  getViewTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewTrialArrangementsContent';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {DocumentType} from 'models/document/documentType';
import {CaseRole} from 'form/models/caseRoles';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';

describe('test getViewTrialArrangements', () => {
  const VIEW_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_TRIAL_ARRANGEMENTS';
  it('should return trial arrangements content for the current party (respondent) if isOtherParty false', () => {
    //Given
    const claim: Claim = new Claim();
    claim.caseProgression = {
      defendantTrialArrangements: {
        isCaseReady: YesNo.NO,
        trialArrangementsDocument: {
          id: '2345',
          value: {
            'createdBy': 'Civil',
            'documentLink': {
              'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2',
              'document_filename': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
              'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2/binary',
            },
            'documentName': 'defendant_Richards_21_June_2022_Trial_Arrangements.pdf',
            'documentSize': 56461,
            documentType: DocumentType.TRIAL_READY_DOCUMENT,
            createdDatetime: new Date('2022-06-21T14:15:19'),
            ownedBy: CaseRole.DEFENDANT,
          },
        },
      },
    };
    const isOtherParty = false;
    const viewTrialArrangementsContentExpected: ClaimSummarySection[] = [
      {
        type: ClaimSummaryType.TITLE,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_YOU`,
        },
      },
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_YOUR_TRIAL_ARRANGEMENTS`,
        },
      },
      {
        type: ClaimSummaryType.NEW_TAB_BUTTON,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`,
          href: CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', 'e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab2'),
        },
      },
    ];
    //When
    const viewTrialArrangementsContent = getViewTrialArrangements(isOtherParty, claim);
    //Then
    expect(viewTrialArrangementsContentExpected).toEqual(viewTrialArrangementsContent);
  });

  it('should return trial arrangements content for the other party (claimant) if isOtherParty true', () => {
    //Given
    const claim: Claim = new Claim();
    claim.caseProgression = {
      claimantTrialArrangements: {
        isCaseReady: YesNo.NO,
        trialArrangementsDocument: {
          id: '1234',
          value: {
            'createdBy': 'Civil',
            'documentLink': {
              'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5',
              'document_filename': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
              'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5/binary',
            },
            'documentName': 'claimant_Clark_21_June_2022_Trial_Arrangements.pdf',
            'documentSize': 56461,
            documentType: DocumentType.TRIAL_READY_DOCUMENT,
            createdDatetime: new Date('2022-06-21T14:15:19'),
            ownedBy: CaseRole.CLAIMANT,
          },
        },
      },
    };
    const isOtherParty = true;
    const viewTrialArrangementsContentExpected: ClaimSummarySection[] = [
      {
        type: ClaimSummaryType.TITLE,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_OTHER_PARTY`,
        },
      },
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_OTHER_PARTY`,
        },
      },
      {
        type: ClaimSummaryType.NEW_TAB_BUTTON,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`,
          href: CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', 'e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab5'),
        },
      },
    ];
    //When
    const viewTrialArrangementsContent = getViewTrialArrangements(isOtherParty, claim);
    //Then
    expect(viewTrialArrangementsContentExpected).toEqual(viewTrialArrangementsContent);
  });
});
