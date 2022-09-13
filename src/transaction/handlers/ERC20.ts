import { BigNumber } from "ethers";
import { ERC20__factory } from "../../contracts";
import { ApprovalEventObject, TransferEventObject } from "../../contracts/ERC20";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc20Interface = ERC20__factory.createInterface();

export type ERC20Transfer = {
  type: "ERC20",
  contract: string,
  event: "Transfer",
  from: string,
  to: string,
  amount: string,
}

export type ERC20Approval = {
  type: "ERC20",
  contract: string,
  event: "Approval",
  owner: string,
  operator: string,
  amount: string,
}

export type ERC20PredictedImpact = ERC20Transfer | ERC20Approval;

export const handleERC20: TransactionHandler = (event) => {
  const predictedImpacts: PredictedImpact[] = [];
  const logDescription = erc20Interface.parseLog(event);

  const contractAddress = event.contract.toLowerCase();

  switch (logDescription.name) {
    case "Transfer": {
      const transferEvent = logDescription.args as unknown as TransferEventObject
      predictedImpacts.push({
        type: "ERC20",
        contract: contractAddress,
        event: "Transfer",
        from: transferEvent.from.toLowerCase(),
        to: transferEvent.to.toLowerCase(),
        amount: transferEvent.value.toString(),
      });
      break;
    }
    case "Approval": {
      const approvalEvent = logDescription.args as unknown as ApprovalEventObject
      predictedImpacts.push({
        type: "ERC20",
        contract: contractAddress,
        event: "Approval",
        owner: approvalEvent.owner.toLowerCase(),
        operator: approvalEvent.spender.toLowerCase(),
        amount: approvalEvent.value.toString(),
      });
      break;
    }
  }

  return predictedImpacts;
};

export type ERC20BalanceChange = {
  [contractAddress: string]: {
    [ownerAddress: string]: BigNumber
  }
}

export const computeERC20BalanceChange = (state: ERC20BalanceChange = {}, predictedImpact: ERC20PredictedImpact) => {
  if (predictedImpact.event !== "Transfer") {
    return state;
  }

  if (!state[predictedImpact.contract]) {
    state[predictedImpact.contract] = {}
  }

  if (!state[predictedImpact.contract][predictedImpact.from]) {
    state[predictedImpact.contract][predictedImpact.from] = BigNumber.from(0);
  }
  state[predictedImpact.contract][predictedImpact.from] = state[predictedImpact.contract][predictedImpact.from].sub(predictedImpact.amount)

  if (!state[predictedImpact.contract][predictedImpact.to]) {
    state[predictedImpact.contract][predictedImpact.to] = BigNumber.from(0);
  }
  state[predictedImpact.contract][predictedImpact.to] = state[predictedImpact.contract][predictedImpact.to].add(predictedImpact.amount)

  return state;
}
