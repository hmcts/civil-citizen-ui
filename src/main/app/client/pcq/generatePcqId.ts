const {v4: uuidv4} = require('uuid');

const generatePcqId = () => {
  return { pcqId: uuidv4() }
};
