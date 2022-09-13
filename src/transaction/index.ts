import { PredictedImpact } from "../types/PredictedImpact";
import { TransactionHandler } from "./TransactionHandler";
import { DebugTraceCallResult } from "../types/Tracer";
import { provider } from "../../src/provider";

// handlers
import { computeERC20BalanceChange, ERC20BalanceChange, handleERC20 } from "./handlers/ERC20";
import { computeERC1155BalanceChange, ERC1155BalanceChange, handleERC1155 } from "./handlers/ERC1155";
import { computeERC712BalanceChange, ERC721BalanceChange, handleERC721 } from "./handlers/ERC721";
import { ContractType } from "../types/ContractType";
import { BigNumber, ethers, Transaction } from "ethers";
import { probeContract } from "../contractProber";
import { getTracerFunc } from "../tracer";
import { BalanceChange } from "../types/BalanceChange";
import { AssetType } from "../types/Asset";

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
    } catch (error) {
      console.error(error)
    }
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
      console.log("probed: ", event.contract, " for type: ", contractType)
      return getPredictedImpactForTransaction(contractType, event);
    })
  ).then(result => result.flat());
}

type BalancesState = {
  ERC20?: ERC20BalanceChange,
  ERC721?: ERC721BalanceChange,
  ERC1155?: ERC1155BalanceChange,
}

export function generateBalanceChanges(transaction: Transaction, predictedImpacts: PredictedImpact[]): BalanceChange[] {
  const balanceChanges: BalanceChange[] = []

  if (!transaction.from) {
    throw new Error("uncomplete transaction");
  }

  const transactionFrom = transaction.from.toLowerCase()

  const transactionValue = BigNumber.from(transaction.value);

  if (!transactionValue.isZero()) {
    balanceChanges.push({
      type: AssetType.NATIVE,
      address: transaction.from,
      delta: transactionValue.mul(-1).toString(),
    })
  }

  // we sort PredictedImpacts by contract address and types

  const balanceState = predictedImpacts.reduce((acc: BalancesState, predictedImpact) => {
    if (!("event" in predictedImpact)) {
      return acc;
    }

    if (predictedImpact.type === "ERC20") {
      acc.ERC20 = computeERC20BalanceChange(acc.ERC20, predictedImpact);
    }

    if (predictedImpact.type === "ERC721") {
      acc.ERC721 = computeERC712BalanceChange(acc.ERC721, predictedImpact);
    }

    if (predictedImpact.type === "ERC1155") {
      acc.ERC1155 = computeERC1155BalanceChange(acc.ERC1155, predictedImpact);
    }

    return acc;
  }, {});

  console.log(JSON.stringify(balanceState, null, 4))

  if (balanceState.ERC20) {
    const ERC20BalanceState = balanceState.ERC20;
    const contractAddresses = Object.keys(ERC20BalanceState);

    for (let i = 0; i < contractAddresses.length; i++) {
      const contractAddress = contractAddresses[i];

      if (ERC20BalanceState[contractAddress][transactionFrom]) {
        balanceChanges.push({
          type: AssetType.ERC20,
          address: transactionFrom,
          contract: contractAddress,
          delta: ERC20BalanceState[contractAddress][transactionFrom].toString()
        })
      }
    }
  }

  if (balanceState.ERC721) {
    const ERC721BalanceState = balanceState.ERC721;
    const contractAddresses = Object.keys(ERC721BalanceState);

    for (let i = 0; i < contractAddresses.length; i++) {
      const contractAddress = contractAddresses[i];

      if (ERC721BalanceState[contractAddress][transactionFrom]) {
        balanceChanges.push({
          type: AssetType.ERC721,
          address: transactionFrom,
          contract: contractAddress,
          sent: ERC721BalanceState[contractAddress][transactionFrom].sent,
          received: ERC721BalanceState[contractAddress][transactionFrom].received
        })
      }
    }
  }

  if (balanceState.ERC1155) {
    const ERC1155BalanceState = balanceState.ERC1155;
    const contractAddresses = Object.keys(ERC1155BalanceState);

    for (let i = 0; i < contractAddresses.length; i++) {
      const contractAddress = contractAddresses[i];

      if (ERC1155BalanceState[contractAddress][transactionFrom]) {
        const typeIds = Object.keys(ERC1155BalanceState[contractAddress][transactionFrom]);
        balanceChanges.push({
          type: AssetType.ERC1155,
          address: transactionFrom,
          contract: contractAddress,
          amounts: typeIds.map(typeId => ({
            id: typeId,
            delta: ERC1155BalanceState[contractAddress][transactionFrom][typeId].toString()
          })),
        });
      }
    }
  }

  return balanceChanges;
}