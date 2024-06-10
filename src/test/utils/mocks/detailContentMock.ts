import {DetailsComponent, DetailsComponentContentBuilder} from 'models/summaryText/detailsComponent';
import {disclosureOfDocumentsUrl, practiceDirection31bUrl} from 'common/utils/externalURLs';

export const  getWhatIsDisclosureDetailContentMock = () => {
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

export const  getWhatIsDifferenceDisclosureDocumentsContentMock = () => {
  const DISCLOSURE_OF_DOCUMENTS = 'PAGES.DISCLOSURE_OF_DOCUMENTS.';
  return new DetailsComponent(`${DISCLOSURE_OF_DOCUMENTS}WHAT_IS_THE_DIFFERENCE`, new DetailsComponentContentBuilder()
    .addTitle(`${DISCLOSURE_OF_DOCUMENTS}TITLE_1`)
    .addParagraph(`${DISCLOSURE_OF_DOCUMENTS}PARAGRAPH_1.1`)
    .addParagraph(`${DISCLOSURE_OF_DOCUMENTS}PARAGRAPH_1.2`)
    .addParagraph(`${DISCLOSURE_OF_DOCUMENTS}PARAGRAPH_1.3`)
    .addTitle(`${DISCLOSURE_OF_DOCUMENTS}TITLE_2`)
    .addParagraph(`${DISCLOSURE_OF_DOCUMENTS}PARAGRAPH_2.1`)
    .addParagraph(`${DISCLOSURE_OF_DOCUMENTS}PARAGRAPH_2.2`)
    .addTitle(`${DISCLOSURE_OF_DOCUMENTS}TITLE_3`)
    .addLink(`${DISCLOSURE_OF_DOCUMENTS}URL.TEXT`,
      practiceDirection31bUrl,
      `${DISCLOSURE_OF_DOCUMENTS}URL.BEFORE`,
      `${DISCLOSURE_OF_DOCUMENTS}URL.AFTER`,
      null,
      true)
    .build());
};
