export const getEmptyStringIfUndefined = (value: string): string => value || '';

export const getAffirmation =(value:string)=> {
  if (value==="yes")
    return "COMMON.YES";

  if (value === "no")
    return "COMMON.NO";

  return;

}