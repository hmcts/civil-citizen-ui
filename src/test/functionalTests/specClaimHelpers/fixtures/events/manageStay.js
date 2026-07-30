module.exports = {
  liftStay: () => {
    return {
      manageStayOption: 'LIFT_STAY',
    };
  },

  requestUpdate: () => {
    return {
      manageStayOption: 'REQUEST_UPDATE',
    };
  },
};
