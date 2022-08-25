import { PredictedImpact } from "../types/PredictedImpact";
import { TransactionHandler } from "./TransactionHandler";
import { DebugTraceCallResult } from "../types/Tracer";

// handlers
import { handleERC20 } from "./handlers/ERC20";
import { handleERC1155 } from "./handlers/ERC1155";
import { handleERC721 } from "./handlers/ERC721";
import { ContractType } from "../types/ContractType";
import { ethers } from "ethers";

const handlers: { [assetType: string]: TransactionHandler } = {
  [ContractType.ERC20]: handleERC20,
  [ContractType.ERC721]: handleERC721,
  [ContractType.ERC1155]: handleERC1155,
};

export function getPredictedImpactForTransaction(
  contractType: ContractType,
  event: DebugTraceCallResult
) {
  const predictedImpacts: PredictedImpact[] = [];

  const handler = handlers[contractType];

  if (handler) {
    try {
      event.topics = event.topics.map((topic) =>
        ethers.utils.hexZeroPad(`0x${topic}`, 32)
      );

      const impacts = handler(event);

      if (impacts.length) {
        predictedImpacts.push(...impacts);
      }
    } catch (error) {}
  }

  return predictedImpacts;
}
