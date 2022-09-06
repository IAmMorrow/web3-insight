import { PredictedImpact } from "../types/PredictedImpact";
import { TransactionHandler } from "./TransactionHandler";
import { DebugTraceCallResult } from "../types/Tracer";
import { provider } from "../../src/provider";

// handlers
import { handleERC20 } from "./handlers/ERC20";
import { handleERC1155 } from "./handlers/ERC1155";
import { handleERC721 } from "./handlers/ERC721";
import { ContractType } from "../types/ContractType";
import { BigNumber, ethers, Transaction } from "ethers";
import { probeContract } from "../contractProber";
import { getTracerFunc } from "../tracer";
import { BalanceChange } from "../types/BalanceChange";

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

export async function getTransactionEvents(transaction: Transaction) {
  return provider.send("debug_traceCall", [
    transaction,
    "latest",
    {
      tracer: getTracerFunc(),
    },
  ]) as Promise<DebugTraceCallResult[]>
}

export async function getPredictedImpactForEvents(events: DebugTraceCallResult[]) {
  return Promise.all(
    events.map(async (event) => {
      const contractType = await probeContract(event.contract, provider);
      console.log("probed: ", contractType, " for type: ", event.contract)
      return getPredictedImpactForTransaction(contractType, event);
    })
  );
}

type ERC20BalanceForAddress = {
  [contractAddress: string]: BigNumber
}

type BalancesState = {
  ERC20: {
    [contractAddress: string]: {
      [ownerAddress: string]: BigNumber
    }
  },
  ERC721: {
    [contractAddress: string]: {
      [ownerAddress: string]: string[]
    }
  }
}

export function generateBalanceChanges(transaction: Transaction, predictedImpacts: PredictedImpact[]): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  if (!transaction.from) {
    throw new Error("uncomplete transaction");
  }

  const transactionFrom = transaction.from

  if (!transaction.value.isZero()) {
    balanceChanges.push({
      type: "NATIVE",
      address: transaction.from,
      delta: transaction.value.mul(-1).toString(),
    })
  }

  // we sort PredictedImpacts by contract address and types

  predictedImpacts.reduce((acc: BalancesState, predictedImpact) => {
    if (!("event" in predictedImpact)) {
      return acc;
    }

    if (predictedImpact.type === "ERC20" && predictedImpact.event === "Transfer") {
      
    }

    return acc;
  }, { ERC20: {}, ERC721: {} })

  return balanceChanges;
}