const {assignCaseToDefendant, unAssignUserFromCases} = require('./testingSupport');

let userCaseMappings = {};

const addUserCaseMapping = (caseId, user) => {
  const userCase = userCaseMappings[`${user.email}`];
  userCaseMappings = {...userCaseMappings, [`${user.email}`]: [...(userCase ? userCase : []), {caseId, user}]};
};

const assignCaseRoleToUser = async (caseId, role, user) => {
  console.log('assignCaseRoleToUser-> : ' + caseId);
  await assignCaseToDefendant(caseId, role, user);
  addUserCaseMapping(caseId, user);
};

const unAssignAllUsers = async () => {
  console.log('Removing case role allocations...');
  for (const userRole of Object.values(userCaseMappings)) {
    await unAssignUserFromCases(userRole.map(({caseId}) => {
      console.log('CaseId in unAssignUserFromCases : ' + caseId);
      caseId;
    }), userRole[0].user);
  }
  userCaseMappings = {};
};

module.exports = {
  addUserCaseMapping,
  assignCaseRoleToUser,
  unAssignAllUsers,
};
