export const deepCopy = <GenericType>(target: GenericType): GenericType => {
  return JSON.parse(JSON.stringify(target));
};
