import {YesNo} from "common/form/models/yesNo";
import {Mediation} from "models/mediation/mediation";

export const toAgreedMediation = (mediation: Mediation): string => {
  if (mediation) {
    if (mediation.canWeUse.option === YesNo.YES) {
      return 'Yes';
    } else {
      return 'No';
    }
  }
};
