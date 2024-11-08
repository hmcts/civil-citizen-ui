import {DetailsComponent, DetailsComponentContentBuilder} from 'models/summaryText/detailsComponent';
import {
  cpr26,
  disclosureOfDocumentsUrl,
  electronicDocumentQuestionnaireUrl,
  practiceDirection31b10Url,
  practiceDirection31bUrl, table14,
} from 'common/utils/externalURLs';
import {t} from 'i18next';

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

export const  getWhatIsDifferenceDisclosureDocumentsContent = () => {
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

export const getHowToAgreeDisclosureOfElectronicDocumentsContent = () => {
  const HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS = 'HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS.DETAILS.';
  return new DetailsComponent(`${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}TITLE`, new DetailsComponentContentBuilder()
    .addParagraph(`${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}PARAGRAPH1`)
    .addLink(`${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL1.TEXT`,
      electronicDocumentQuestionnaireUrl,
      `${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL1.BEFORE`,
      `${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL1.AFTER`,
      null,
      true)
    .addLink(`${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL2.TEXT`,
      practiceDirection31b10Url,
      `${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL2.BEFORE`,
      `${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL2.AFTER`,
      null,
      true)
    .addLink(`${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL3.TEXT`,
      practiceDirection31bUrl,
      `${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL3.BEFORE`,
      `${HOW_TO_AGREE_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS}URL3.AFTER`,
      null,
      true)
    .build());
};

export const getWhatAreFixedRecoverableCostsContent = (lang: string) => {
  const FIXED_RECOVERABLE_COSTS = 'WHAT_ARE_FIXED_RECOVERABLE_COSTS.';
  return new DetailsComponent(`${FIXED_RECOVERABLE_COSTS}TITLE`, new DetailsComponentContentBuilder()
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_1`)
    .addTitle(`${FIXED_RECOVERABLE_COSTS}PARA_2_1`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_2`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_3`)
    .addLink(`${FIXED_RECOVERABLE_COSTS}URL.TEXT`,
      table14,
      `${FIXED_RECOVERABLE_COSTS}URL.BEFORE`,
      `${FIXED_RECOVERABLE_COSTS}URL.AFTER`,
      null,
      true)
    .addTitle(`${FIXED_RECOVERABLE_COSTS}PARA_4_1`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_4`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_5`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_5_1', {lng: lang})}</li>
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_5_2', {lng: lang})}</li>
            </ul>`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_5_3`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_6`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_6_1', {lng: lang})}</li>
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_6_2', {lng: lang})}</li>
            </ul>`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_6_3`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_7`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_7_1', {lng: lang})}</li>
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_7_2', {lng: lang})}</li>
            </ul>`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_7_3`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_8`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_8_1', {lng: lang})}</li>
                <li>${t(FIXED_RECOVERABLE_COSTS+'PARA_8_2', {lng: lang})}</li>
            </ul>`)
    .addTitle(`${FIXED_RECOVERABLE_COSTS}PARA_9`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_9_1`)
    .addParagraph(`${FIXED_RECOVERABLE_COSTS}PARA_10`)
    .build());
};

export const  getWhichComplexityBandToChooseContent = (lang: string) => {
  const WHICH_COMPLEXITY_BAND_TO_CHOOSE = 'WHICH_COMPLEXITY_BAND_TO_CHOOSE.';
  return new DetailsComponent(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}TITLE`, new DetailsComponentContentBuilder()
    .addTitle(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_1_TITLE`)
    .addParagraph(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_1`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_1_POINT_1', {lng: lang})}</li>
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_1_POINT_2', {lng: lang})}</li>
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_1_POINT_3', {lng: lang})}</li>
            </ul>`)
    .addTitle(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_2_TITLE`)
    .addParagraph(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_2`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_2_POINT_1', {lng: lang})}</li>
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_2_POINT_2', {lng: lang})}</li>
            </ul>`)
    .addTitle(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_3_TITLE`)
    .addParagraph(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_3`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_3_POINT_1', {lng: lang})}</li>
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_3_POINT_2', {lng: lang})}</li>
            </ul>`)
    .addTitle(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_4_TITLE`)
    .addParagraph(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}PARA_4`)
    .addRawHtml(
      `<ul class="govuk-list govuk-list--bullet govuk-!-static-padding-left-7">
                <li>${t(WHICH_COMPLEXITY_BAND_TO_CHOOSE+'PARA_4_POINT_1', {lng: lang})}</li>
            </ul>`)
    .addTitle(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}URL.TITLE`)
    .addLink(`${WHICH_COMPLEXITY_BAND_TO_CHOOSE}URL.TEXT`,
      cpr26,
      `${WHICH_COMPLEXITY_BAND_TO_CHOOSE}URL.BEFORE`,
      `${WHICH_COMPLEXITY_BAND_TO_CHOOSE}URL.AFTER`,
      null,
      true)
    .build());
};
