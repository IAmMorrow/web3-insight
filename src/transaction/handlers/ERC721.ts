import { BigNumber } from "ethers";
import { ERC721__factory } from "../../contracts";
import { ApprovalEventObject, ApprovalForAllEventObject, TransferEventObject } from "../../contracts/ERC721";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc721Interface = ERC721__factory.createInterface();

export type ERC721Transfer = {
  type: "ERC721",
  contract: string,
  event: "Transfer",
  from: string,
  to: string,
  tokenId: string,
}

export type ERC721Approval = {
  type: "ERC721",
  contract: string,
  event: "Approval",
  owner: string,
  operator: string,
  tokenId: string,
}

export type ERC721ApprovalForAll = {
  type: "ERC721",
  contract: string,
  event: "ApprovalForAll",
  owner: string,
  operator: string,
  approved: boolean,
}

export type ERC721PredictedImpact = ERC721Transfer | ERC721Approval | ERC721ApprovalForAll;

export const handleERC721: TransactionHandler = (event) => {
  const predictedImpacts: PredictedImpact[] = [];
  const logDescription = erc721Interface.parseLog(event);

  const contractAddress = event.contract.toLowerCase();

  switch (logDescription.name) {
    case "Transfer": {
      const transferEvent = logDescription.args as unknown as TransferEventObject
      predictedImpacts.push({
        type: "ERC721",
        contract: contractAddress,
        event: "Transfer",
        from: transferEvent.from.toLowerCase(),
        to: transferEvent.to.toLowerCase(),
        tokenId: transferEvent.tokenId.toString(),
      });
      break;
    }
    case "Approval": {
      const approvalEvent = logDescription.args as unknown as ApprovalEventObject
      predictedImpacts.push({
        type: "ERC721",
        contract: contractAddress,
        event: "Approval",
        owner: approvalEvent.owner.toLowerCase(),
        operator: approvalEvent.approved,
        tokenId: approvalEvent.tokenId.toString(),
      });
      break;
    }
    case "ApprovalForAll": {
      const approvalForAllEvent = logDescription.args as unknown as ApprovalForAllEventObject
      predictedImpacts.push({
        type: "ERC721",
        contract: contractAddress,
        event: "ApprovalForAll",
        owner: approvalForAllEvent.owner.toLowerCase(),
        operator: approvalForAllEvent.operator.toLowerCase(),
        approved: approvalForAllEvent.approved,
      });
      break;
    }
  }

  return predictedImpacts;
};

export type ERC721BalanceChange = {
  [contractAddress: string]: {
    [ownerAddress: string]: {
      received: string[],
      sent: string[]
    }
  }
}

export const computeERC712BalanceChange = (state: ERC721BalanceChange = {}, predictedImpact: ERC721PredictedImpact) => {
  if (predictedImpact.event !== "Transfer") {
    return state;
  }

  if (!state[predictedImpact.contract]) {
    state[predictedImpact.contract] = {}
  }

  if (!state[predictedImpact.contract][predictedImpact.from]) {
    state[predictedImpact.contract][predictedImpact.from] = {
      received: [],
      sent: [],
    }
  }

  state[predictedImpact.contract][predictedImpact.from].sent.push(predictedImpact.tokenId)

  if (!state[predictedImpact.contract][predictedImpact.to]) {
    state[predictedImpact.contract][predictedImpact.to] = {
      received: [],
      sent: [],
    }
  }

  state[predictedImpact.contract][predictedImpact.to].received.push(predictedImpact.tokenId)

  return state;
}