export const convertToPence = (amount: number): number => {
  return amount ? Math.round(amount*100) : undefined;
};

export const convertToPenceFromString = (amountString: string): number => {
  return amountString ? Math.round(Number(amountString)*100) : undefined;
};

export const convertToPenceFromStringToString = (amountString: string): string | undefined => {
  const amountPence = convertToPenceFromString(amountString);
  return amountPence ? String(amountPence) : undefined;
};

export const convertToPound = (amount: number): number => {
  return amount ? amount/100 : undefined;
};

export const convertToPoundInStringFormat = (amount: number): string => {
  return amount ? (amount/100).toString() : undefined;
};
