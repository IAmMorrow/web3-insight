import { BigNumber } from "ethers";
import { ERC1155__factory } from "../../contracts";
import { ApprovalForAllEventObject, TransferBatchEventObject, TransferSingleEventObject } from "../../contracts/ERC1155";
import { ContractType } from "../../types/ContractType";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc1155Interface = ERC1155__factory.createInterface();

export type ERC1155ApprovalForAll = {
  standard: ContractType.ERC1155,
  contract: string,
  type: "ApprovalForAll",
  owner: string,
  operator: string,
  approved: boolean,
}

export type ERC1155TransferBatch = {
  standard: ContractType.ERC1155,
  contract: string,
  type: "TransferBatch",
  operator: string,
  from: string,
  to: string,
  ids: string[],
  amounts: string[]
}

export type ERC1155TransferSingle = {
  standard: ContractType.ERC1155,
  contract: string,
  type: "TransferSingle",
  operator: string,
  from: string,
  to: string,
  id: string,
  amount: string
}

export type ERC1155PredictedImpact = ERC1155ApprovalForAll | ERC1155TransferBatch | ERC1155TransferSingle;

export const handleERC1155: TransactionHandler = (event) => {
  const predictedImpacts: PredictedImpact[] = [];
  const logDescription = erc1155Interface.parseLog(event);

  const contractAddress = event.contract.toLowerCase();

  switch (logDescription.name) {
    case "TransferBatch": {
      const transferBatchEvent = logDescription.args as unknown as TransferBatchEventObject

      predictedImpacts.push({
        standard: ContractType.ERC1155,
        contract: contractAddress,
        type: "TransferBatch",
        operator: transferBatchEvent.operator.toLowerCase(),
        from: transferBatchEvent.from.toLowerCase(),
        to: transferBatchEvent.to.toLowerCase(),
        ids: transferBatchEvent.ids.map(id => id.toString()),
        amounts: transferBatchEvent.values.map(value => value.toString()),
      });
      break;
    }
    case "TransferSingle": {
      const transferSingleEvent = logDescription.args as unknown as TransferSingleEventObject

      predictedImpacts.push({
        standard: ContractType.ERC1155,
        contract: contractAddress,
        type: "TransferSingle",
        operator: transferSingleEvent.operator.toLowerCase(),
        from: transferSingleEvent.from.toLowerCase(),
        to: transferSingleEvent.to.toLowerCase(),
        id: transferSingleEvent.id.toString(),
        amount: transferSingleEvent.value.toString(),
      });
      break;
    }
    case "ApprovalForAll": {
      const approveForAllSingleEvent = logDescription.args as unknown as ApprovalForAllEventObject

      predictedImpacts.push({
        standard: ContractType.ERC1155,
        contract: contractAddress,
        type: "ApprovalForAll",
        owner: approveForAllSingleEvent.account.toLowerCase(),
        operator: approveForAllSingleEvent.operator.toLowerCase(),
        approved: approveForAllSingleEvent.approved,
      });
      break;
    }
  }

  return predictedImpacts;
};

export type ERC1155BalanceChange = {
  [contractAddress: string]: {
    [ownerAddress: string]: {[id: string]: BigNumber}
  }
}

export const computeERC1155BalanceChange = (state: ERC1155BalanceChange = {}, predictedImpact: ERC1155PredictedImpact) => {
  if (predictedImpact.type === "ApprovalForAll") {
    return state;
  }

  if (!state[predictedImpact.contract]) {
    state[predictedImpact.contract] = {}
  }

  const contractState = state[predictedImpact.contract];

  if (!contractState[predictedImpact.from]) {
    contractState[predictedImpact.from] = {}
  }

  const contractStateFrom = contractState[predictedImpact.from];

  if (!contractState[predictedImpact.to]) {
    contractState[predictedImpact.to] = {}
  }

  const contractStateTo = contractState[predictedImpact.to];

  if (predictedImpact.type === "TransferBatch") {
    for (let i = 0; i < predictedImpact.ids.length; i++) {
      const typeId = predictedImpact.ids[i];
      const amount = predictedImpact.amounts[i];

      if (!contractStateFrom[typeId]) {
        contractStateFrom[typeId] = BigNumber.from(0);
      }
 
      if (!contractStateTo[typeId]) {
        contractStateTo[typeId] = BigNumber.from(0);
      }

      contractStateFrom[typeId] = contractStateFrom[typeId].sub(amount)
      contractStateTo[typeId] = contractStateTo[typeId].add(amount)
    }
  }

  if (predictedImpact.type === "TransferSingle") {
    const typeId = predictedImpact.id;
    const amount = predictedImpact.amount;

    if (!contractStateFrom[typeId]) {
      contractStateFrom[typeId] = BigNumber.from(0);
    }

    if (!contractStateTo[typeId]) {
      contractStateTo[typeId] = BigNumber.from(0);
    }

    contractStateFrom[typeId] = contractStateFrom[typeId].sub(amount)
    contractStateTo[typeId] = state[predictedImpact.contract][predictedImpact.to][typeId].add(amount)
  }

  return state;
}
