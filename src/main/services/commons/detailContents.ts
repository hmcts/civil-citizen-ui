import {DetailsComponent, DetailsComponentContentBuilder} from 'models/summaryText/detailsComponent';
import {disclosureOfDocumentsUrl} from 'common/utils/externalURLs';

export const  getWhatIsDisclosureDetailContent = () => {
  const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS = 'DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.TEXT_AREA.';
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
