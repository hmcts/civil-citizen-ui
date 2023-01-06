import {BreathingSpace} from "models/breathingSpace";
import {CCDBreathingSpace, CCDBreathingSpaceEnter} from "models/ccdBreathingSpace/ccdBreathingScpace";



export const toCcdBreathingSpaceEnter = (breathingSpace: BreathingSpace): CCDBreathingSpaceEnter =>{
  return {
    reference: breathingSpace.debtRespiteReferenceNumber.referenceNumber,
    start: breathingSpace.debtRespiteStartDate.date,
    expectedEnd: breathingSpace.debtRespiteEndDate.date,
    type: breathingSpace.debtRespiteOption.type
  }
}


export const convertToCCDBreathingSpace = (breathingSpace: BreathingSpace): CCDBreathingSpace=>{
  return {
    enter : toCcdBreathingSpaceEnter(breathingSpace)
  }
}

