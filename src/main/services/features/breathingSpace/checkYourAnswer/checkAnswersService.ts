import {SummarySections} from 'models/summaryList/summarySections';
import {buildDebtRespiteSection} from '../debtRespiteScheme/buildDebtRespiteSection';
import {BreathingSpace} from 'models/breathingSpace';

const buildSummarySections = (breathingSpace: BreathingSpace, claimId: string, lang: string): SummarySections => {

  return {
    sections: [
      buildDebtRespiteSection(breathingSpace, claimId, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, breathingSpace: BreathingSpace, lang?: string): SummarySections => {
  return buildSummarySections(breathingSpace, claimId, lang);
};
