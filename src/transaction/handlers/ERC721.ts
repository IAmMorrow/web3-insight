import { BigNumber, Contract } from "ethers";
import { ERC721__factory } from "../../contracts";
import { ApprovalEventObject, ApprovalForAllEventObject, TransferEventObject } from "../../contracts/ERC721";
import { ContractType } from "../../types/ContractType";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc721Interface = ERC721__factory.createInterface();

export type ERC721Transfer = {
  standard: ContractType.ERC721,
  contract: string,
  type: "Transfer",
  from: string,
  to: string,
  tokenId: string,
}

export type ERC721Approval = {
  standard: ContractType.ERC721,
  contract: string,
  type: "Approval",
  owner: string,
  operator: string,
  tokenId: string,
}

export type ERC721ApprovalForAll = {
  standard: ContractType.ERC721,
  contract: string,
  type: "ApprovalForAll",
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
        standard: ContractType.ERC721,
        contract: contractAddress,
        type: "Transfer",
        from: transferEvent.from.toLowerCase(),
        to: transferEvent.to.toLowerCase(),
        tokenId: transferEvent.tokenId.toString(),
      });
      break;
    }
    case "Approval": {
      const approvalEvent = logDescription.args as unknown as ApprovalEventObject
      predictedImpacts.push({
        standard: ContractType.ERC721,
        contract: contractAddress,
        type: "Approval",
        owner: approvalEvent.owner.toLowerCase(),
        operator: approvalEvent.approved,
        tokenId: approvalEvent.tokenId.toString(),
      });
      break;
    }
    case "ApprovalForAll": {
      const approvalForAllEvent = logDescription.args as unknown as ApprovalForAllEventObject
      predictedImpacts.push({
        standard: ContractType.ERC721,
        contract: contractAddress,
        type: "ApprovalForAll",
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
    [ownerAddress: string]: {[id: string]: BigNumber}
  }
}

export const computeERC712BalanceChange = (state: ERC721BalanceChange = {}, predictedImpact: ERC721PredictedImpact) => {
  if (predictedImpact.type !== "Transfer") {
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

  const tokenId = predictedImpact.tokenId;
  const amount = BigNumber.from(1);

  if (!contractStateFrom[tokenId]) {
    contractStateFrom[tokenId] = BigNumber.from(0);
  }

  if (!contractStateTo[tokenId]) {
    contractStateTo[tokenId] = BigNumber.from(0);
  }

  contractStateFrom[tokenId] = contractStateFrom[tokenId].sub(amount)
  contractStateTo[tokenId] = contractStateTo[tokenId].add(amount)

  return state;
}