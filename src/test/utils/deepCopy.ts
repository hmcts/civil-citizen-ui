export const deepCopy = <GenericType>(obj: GenericType): GenericType => {
  return JSON.parse(JSON.stringify(obj));
};