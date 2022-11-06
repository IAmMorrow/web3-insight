import { BigNumber, constants } from "ethers";
import { ERC20__factory } from "../../contracts";
import { ApprovalEventObject, TransferEventObject, DepositEventObject, WithdrawalEventObject } from "../../contracts/ERC20";
import { ContractType } from "../../types/ContractType";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc20Interface = ERC20__factory.createInterface();

export type ERC20Transfer = {
  standard: ContractType.ERC20,
  contract: string,
  type: "Transfer",
  from: string,
  to: string,
  amount: string,
}

export type ERC20Approval = {
  standard: ContractType.ERC20,
  contract: string,
  type: "Approval",
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
        standard: ContractType.ERC20,
        contract: contractAddress,
        type: "Transfer",
        from: transferEvent.from.toLowerCase(),
        to: transferEvent.to.toLowerCase(),
        amount: transferEvent.value.toString(),
      });
      break;
    }
    case "Approval": {
      const approvalEvent = logDescription.args as unknown as ApprovalEventObject
      predictedImpacts.push({
        standard: ContractType.ERC20,
        contract: contractAddress,
        type: "Approval",
        owner: approvalEvent.owner.toLowerCase(),
        operator: approvalEvent.spender.toLowerCase(),
        amount: approvalEvent.value.toString(),
      });
      break;
    }
    case "Deposit": {
      const depositEvent = logDescription.args as unknown as DepositEventObject
      predictedImpacts.push({
        standard: ContractType.ERC20,
        contract: contractAddress,
        type: "Transfer",
        from: constants.AddressZero,
        to: depositEvent.to.toLowerCase(),
        amount: depositEvent.value.toString(),
      });
      break;
    }
    case "Withdrawal": {
      const withdrawalEvent = logDescription.args as unknown as WithdrawalEventObject
      predictedImpacts.push({
        standard: ContractType.ERC20,
        contract: contractAddress,
        type: "Transfer",
        from: withdrawalEvent.from.toLocaleLowerCase(),
        to: constants.AddressZero,
        amount: withdrawalEvent.value.toString(),
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
  if (predictedImpact.type !== "Transfer") {
    return state;
  }

  if (!state[predictedImpact.contract]) {
    state[predictedImpact.contract] = {}
  }

  const contractState = state[predictedImpact.contract];

  if (!contractState[predictedImpact.from]) {
    contractState[predictedImpact.from] = BigNumber.from(0);
  }
  contractState[predictedImpact.from] = contractState[predictedImpact.from].sub(predictedImpact.amount)

  if (!contractState[predictedImpact.to]) {
    contractState[predictedImpact.to] = BigNumber.from(0);
  }
  contractState[predictedImpact.to] = contractState[predictedImpact.to].add(predictedImpact.amount)

  return state;
}
