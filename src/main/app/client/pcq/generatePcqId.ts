const {v4: uuidv4} = require('uuid');

export const generatePcqId = (): string => {
  return uuidv4();
};
