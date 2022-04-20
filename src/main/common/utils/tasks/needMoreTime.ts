import { Task } from "../../form/models/task";
import { Claim } from "../../models/claim";
import { getDraftClaimFromStore } from "../../../modules/draft-store/draftStoreService";
import { TaskStatus } from "../../form/models/TaskStatus";

/**
 * THIS FILE IS A CONCEPT AND DOESN'T WORK
 * 
 * The logic on this file is not the real bussines logic.
 * This code is only a concept of what we should do. 
 * 
 */

const needMoreTimeTask = {
  description: "Decide if you need more time to respond",
  url: "/more-time",
  status: TaskStatus.INCOMPLETE
};

export const getneedMoreTimeTask = async (claimId: string): Promise<Task> => {
  const claim: Claim = await getDraftClaimFromStore(claimId);

  if (claim.statementOfMeans?.cohabiting?.option === 'yes') {
    needMoreTimeTask.status === TaskStatus.COMPLETE
  }

  return needMoreTimeTask;
}

