import {DetailsComponent, DetailsComponentContentBuilder} from 'models/summaryText/detailsComponent';
import {
  disclosureOfDocumentsUrl,
  electronicDocumentQuestionnaireUrl,
  firstPracticeDirection10Url,
  firstPracticeDirection31Url,
} from 'common/utils/externalURLs';

export const  getWhatIsDisclosureDetailContent = () => {
  const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS = 'DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.DETAILS.';
  return new DetailsComponent(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}TITLE`, new DetailsComponentContentBuilder()
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}PARAGRAPH1`)
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}PARAGRAPH2`)
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}PARAGRAPH3`)
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}PARAGRAPH4`)
    .addLink(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL.TEXT`,
      disclosureOfDocumentsUrl,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL.BEFORE`,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL.AFTER`,
      null,
      true)
    .build());
};

export const getHowtoAgreeDisclosureOfElectronicDocumentsContent = () => {
  const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS = 'HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS.DETAILS.';
  return new DetailsComponent(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}TITLE`, new DetailsComponentContentBuilder()
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}PARAGRAPH1`)
    .addLink(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL1.TEXT`,
      electronicDocumentQuestionnaireUrl,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL1.BEFORE`,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL1.AFTER`,
      null,
      true)
    .addLink(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL2.TEXT`,
      firstPracticeDirection31Url,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL2.BEFORE`,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL2.AFTER`,
      null,
      true)
    .addLink(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL3.TEXT`,
      firstPracticeDirection10Url,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL3.BEFORE`,
      `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS}URL3.AFTER`,
      null,
      true)
    .build());
};
