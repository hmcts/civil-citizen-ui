import { Task } from "../../../common/form/models/task";
import { Claim } from "../../../common/models/claim";
import { getDraftClaimFromStore } from "../../../modules/draft-store/draftStoreService";
import { TaskStatus } from "../../../common/form/models/TaskStatus";

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 * 
 * The logic on this file is not the real bussines logic.
 * This code is only a concept of what we should do. 
 * 
 */

const confirmYourDetailsTask = {
  description: "Confirm your details",
  url: "/test",
  status: TaskStatus.INCOMPLETE
};

export const getConfirmYourDetailsTask = async (claimId: string): Promise<Task> => {
  const claim: Claim = await getDraftClaimFromStore(claimId);

  if (claim.statementOfMeans?.cohabiting?.option === 'yes') {
    confirmYourDetailsTask.status === TaskStatus.COMPLETE
  }

  return confirmYourDetailsTask;
}

