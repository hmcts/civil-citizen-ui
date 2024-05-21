import {Claim} from 'models/claim';
import {TYPES_OF_DOCUMENTS_URL, MAKE_APPLICATION_TO_COURT, DEFENDANT_SUMMARY_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {t} from 'i18next';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const UPLOAD_YOUR_DOCUMENTS = 'PAGES.UPLOAD_YOUR_DOCUMENTS';

export const getUploadYourDocumentsContents = (claimId: string, claim: Claim) => {
  const afterTheDeadline=t(`${UPLOAD_YOUR_DOCUMENTS}.AFTER_THE_DEADLINE`);
  const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${afterTheDeadline}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href=${t(MAKE_APPLICATION_TO_COURT)}>${t(`${UPLOAD_YOUR_DOCUMENTS}.APPLY_TO_THE_COURT`)}</a>
        ${t(`${UPLOAD_YOUR_DOCUMENTS}.IF_YOU_WANT_ANY`)}
    </p><br>`;

  return new UploadYourDocumentsSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify( claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CHECK_THE_ORDER')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.YOU_CANNOT_WITHDRAW')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.THE_OTHER_PARTIES')
    .addTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.DEADLINES_FOR_UPLOADING')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CHECK_THE_ORDER_DEADLINES')
    .addRawHtml(linkParagraph)
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.YOU_DO_NOT_HAVE')
    .addTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.BEFORE_YOU_UPLOAD_YOUR')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.BEFORE_YOU_UPLOAD_THE')
    .addParagraph('PAGES.UPLOAD_DOCUMENTS.FORMAT')
    .addButtonWithCancelLink('PAGES.UPLOAD_YOUR_DOCUMENTS.START_NOW', constructResponseUrlWithIdParams(claimId,TYPES_OF_DOCUMENTS_URL), true, constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL))
    .build();
};
