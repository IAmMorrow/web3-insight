import { BigNumber } from "ethers";
import { ERC1155__factory } from "../../contracts";
import { ApprovalForAllEventObject, TransferBatchEventObject, TransferSingleEventObject } from "../../contracts/ERC1155";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc1155Interface = ERC1155__factory.createInterface();

export type ERC1155ApprovalForAll = {
  type: "ERC1155",
  contract: string,
  event: "ApprovalForAll",
  owner: string,
  operator: string,
  approved: boolean,
}

export type ERC1155TransferBatch = {
  type: "ERC1155",
  contract: string,
  event: "TransferBatch",
  operator: string,
  from: string,
  to: string,
  ids: string[],
  amounts: string[]
}

export type ERC1155TransferSingle = {
  type: "ERC1155",
  contract: string,
  event: "TransferSingle",
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
        type: "ERC1155",
        contract: contractAddress,
        event: "TransferBatch",
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
        type: "ERC1155",
        contract: contractAddress,
        event: "TransferSingle",
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
        type: "ERC1155",
        contract: contractAddress,
        event: "ApprovalForAll",
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
  if (predictedImpact.event === "ApprovalForAll") {
    return state;
  }

  if (!state[predictedImpact.contract]) {
    state[predictedImpact.contract] = {}
  }

  if (!state[predictedImpact.contract][predictedImpact.from]) {
    state[predictedImpact.contract][predictedImpact.from] = {}
  }

  if (!state[predictedImpact.contract][predictedImpact.to]) {
    state[predictedImpact.contract][predictedImpact.to] = {}
  }

  if (predictedImpact.event === "TransferBatch") {
    for (let i = 0; i < predictedImpact.ids.length; i++) {
      const typeId = predictedImpact.ids[i];
      const amount = predictedImpact.amounts[i];

      if (!state[predictedImpact.contract][predictedImpact.from][typeId]) {
        state[predictedImpact.contract][predictedImpact.from][typeId] = BigNumber.from(0);
      }
 
      if (!state[predictedImpact.contract][predictedImpact.to][typeId]) {
        state[predictedImpact.contract][predictedImpact.to][typeId] = BigNumber.from(0);
      }

      state[predictedImpact.contract][predictedImpact.from][typeId] = state[predictedImpact.contract][predictedImpact.from][typeId].sub(amount)
      state[predictedImpact.contract][predictedImpact.to][typeId] = state[predictedImpact.contract][predictedImpact.to][typeId].add(amount)
    }
  }

  if (predictedImpact.event === "TransferSingle") {
    const typeId = predictedImpact.id;
    const amount = predictedImpact.amount;

    if (!state[predictedImpact.contract][predictedImpact.from][typeId]) {
      state[predictedImpact.contract][predictedImpact.from][typeId] = BigNumber.from(0);
    }

    if (!state[predictedImpact.contract][predictedImpact.to][typeId]) {
      state[predictedImpact.contract][predictedImpact.to][typeId] = BigNumber.from(0);
    }

    state[predictedImpact.contract][predictedImpact.from][typeId] = state[predictedImpact.contract][predictedImpact.from][typeId].sub(amount)
    state[predictedImpact.contract][predictedImpact.to][typeId] = state[predictedImpact.contract][predictedImpact.to][typeId].add(amount)
  }

  return state;
}
