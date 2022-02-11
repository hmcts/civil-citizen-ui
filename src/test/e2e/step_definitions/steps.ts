const { homepage } = require('../pages/homepage');
const { phonenumber } = require('../pages/phonenumber');

const { I } = inject();

homepage(I);
phonenumber(I);
