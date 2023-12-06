import {Claim} from 'models/claim';
import {DASHBOARD_URL, TYPES_OF_DOCUMENTS_URL} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';

export const getUploadYourDocumentsContents = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE')
    .addLeadParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CASE_REFERENCE', {claimId:caseNumberPrettify( claimId)})
    .addLeadParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CHECK_THE_ORDER')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.YOU_CANNOT_WITHDRAW')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.THE_OTHER_PARTIES')
    .addTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.DEADLINES_FOR_UPLOADING')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CHECK_THE_ORDER_DEADLINES')
    .addLink('PAGES.UPLOAD_YOUR_DOCUMENTS.APPLY_TO_THE_COURT', 'TODO: apply to the court URL',
      'PAGES.UPLOAD_YOUR_DOCUMENTS.AFTER_THE_DEADLINE',
      'PAGES.UPLOAD_YOUR_DOCUMENTS.IF_YOU_WANT_ANY')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.YOU_DO_NOT_HAVE')
    .addTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.BEFORE_YOU_UPLOAD_YOUR')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.BEFORE_YOU_UPLOAD_THE')
    .addParagraph('PAGES.UPLOAD_DOCUMENTS.FORMAT')
    .addButtonWithCancelLink('PAGES.UPLOAD_YOUR_DOCUMENTS.START_NOW', TYPES_OF_DOCUMENTS_URL, false, constructResponseUrlWithIdParams(claimId, DASHBOARD_URL)
      .replace(':id', claim.id))
    .build();
};
