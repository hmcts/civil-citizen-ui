import { UploadDocumentsSectionBuilder } from 'common/models/caseProgression/uploadDocumentsSectionBuilder';
import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';
import { formN245Url } from 'common/utils/externalURLs';
import { t } from 'i18next';
import { TypeOfDocumentSectionMapper } from '../caseProgression/TypeOfDocumentSectionMapper';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { saveN245Form } from './generalApplicationService';
import { CivilServiceClient } from 'client/civilServiceClient';
import config from 'config';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

export const getUploadFormContent = (lng: string) => {
  const uploadItHere = t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.UPLOAD_HERE', { lng });
  const linkForN245Form = `<a href="${formN245Url}" target="_blank">${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.COMPLETE_N245_FORM', { lng })}</a>`;
  return new UploadDocumentsSectionBuilder()
    .addRawHtml(`<p class="govuk-body govuk-link">${uploadItHere.replace('LINK_FOR_N245_FORM', linkForN245Form)}</p>`)
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.OFFER_OF_PAYMENT')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.INCOME_AND_EXPENSE')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.WAYS_TO_COMPLETE')
    .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILL_ONLINE', { lng })}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.PRINT_THE_FORM', { lng })}</li>
            </ul>`)
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.SAVE_THE_FORM')
    .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
              <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.NAME_THE_FORM', { lng })}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILE_SIZE', { lng })}</li>
              <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILE_FORMAT', { lng })}</li>
            </ul>`)
    .build();
};

export const uploadSelectedFile = async (req: AppRequest, claim: Claim): Promise<{ form: GenericForm<UploadGAFiles>, documentName: string }> => {
  const uploadedN245Details = new UploadGAFiles();
  const redisKey = generateRedisKey(req);
  const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
  uploadedN245Details.fileUpload = fileUpload;
  const form = new GenericForm(uploadedN245Details);
  form.validateSync();
  if (!form.hasErrors()) {
    uploadedN245Details.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
    saveN245Form(redisKey, claim, uploadedN245Details);
  }
  const documentName = uploadedN245Details.caseDocument?.documentName || claim.generalApplication?.uploadN245Form?.caseDocument?.documentName;
  return Promise.resolve({ form, documentName });
};

