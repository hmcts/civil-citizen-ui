import {UserDetails} from 'models/AppRequest';

const getClaimantIdamDetails = (userDetails: UserDetails) => {
  return {
    email: userDetails.email,
    id: userDetails.id,
  };
};

export {
  getClaimantIdamDetails,
};

