import { PredictedImpact } from "../types/PredictedImpact";
import { TransactionHandler } from "./TransactionHandler";
import { DebugTraceCallResult, DryRunResult } from "../types/Tracer";
import { provider } from "../../src/provider";

// handlers
import {
  computeERC20BalanceChange,
  ERC20BalanceChange,
  handleERC20,
} from "./handlers/ERC20";
import {
  computeERC1155BalanceChange,
  ERC1155ApprovalForAll,
  ERC1155BalanceChange,
  handleERC1155,
} from "./handlers/ERC1155";
import {
  computeERC712BalanceChange,
  ERC721Approval,
  ERC721ApprovalForAll,
  ERC721BalanceChange,
  handleERC721,
} from "./handlers/ERC721";
import { ContractType } from "../types/ContractType";
import { BigNumber, ethers, Transaction } from "ethers";
import { getContractMetadata, probeContract } from "../contractProber";
import { getTracerFunc } from "../tracer";
import { BalanceChange } from "../types/BalanceChange";
import { AssetType } from "../types/Asset";
import axios from "axios";
import {
  computeNATIVEBalanceChange,
  NATIVEBalanceChange,
} from "./handlers/NATIVE";

const handlers: { [assetType: string]: TransactionHandler } = {
  [ContractType.ERC20]: handleERC20,
  [ContractType.ERC721]: handleERC721,
  [ContractType.ERC1155]: handleERC1155,
};

export function getPredictedImpactForEvent(
  contractType: ContractType,
  event: DebugTraceCallResult
) {
  const predictedImpacts: PredictedImpact[] = [];

  const handler = handlers[contractType];

  if (handler) {
    try {
      event.topics = event.topics.map((topic) =>
        ethers.utils.hexZeroPad(topic, 32)
      );

      console.log(event);

      const impacts = handler(event);

      if (impacts.length) {
        predictedImpacts.push(...impacts);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      // console.error(error)
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
  ]) as Promise<DebugTraceCallResult[]>;
}

export async function dryRun(transaction: Transaction) {
  const { data } = await axios.post<DryRunResult>(
    "http://explorers.api-01.live.ledger-stg.com/blockchain/v4/eth/transactions/dryrun?raw=true",
    transaction
  );

  return data;
}

async function probeContracts(contractAddresses: string[]) {
  return Promise.all(
    contractAddresses.map(async (contractAddress) => {
      const contractType = await probeContract(contractAddress, provider);

      return {
        contractAddress,
        contractType,
      };
    })
  );
}

export function getUniqueAddresses(addresses: string[]) {
  const seenAddresses: { [address: string]: boolean } = {};

  for (let i = 0; i < addresses.length; i++) {
    seenAddresses[addresses[i]] = true;
  }

  return Object.keys(seenAddresses);
}

export async function getContractTypeRegistry(addresses: string[]) {
  const probedContracts = await probeContracts(addresses);

  return probedContracts.reduce(
    (
      acc: { [contractAddress: string]: ContractType },
      { contractAddress, contractType }
    ) => {
      acc[contractAddress] = contractType;
      return acc;
    },
    {}
  );
}

type BalancesState = {
  NATIVE?: NATIVEBalanceChange;
  ERC20?: ERC20BalanceChange;
  ERC721?: ERC721BalanceChange;
  ERC1155?: ERC1155BalanceChange;
  approvals?: (ERC721ApprovalForAll | ERC1155ApprovalForAll | ERC721Approval)[];
};

export function generateBalanceChanges(
  transaction: Transaction,
  predictedImpacts: PredictedImpact[]
): BalanceChange[] {
  const balanceChanges: BalanceChange[] = [];

  if (!transaction.from) {
    throw new Error("incomplete transaction");
  }

  // we sort PredictedImpacts by contract address and types

  const balanceState = predictedImpacts.reduce(
    (acc: BalancesState, predictedImpact) => {
      if (predictedImpact.standard === ContractType.NATIVE) {
        acc.NATIVE = computeNATIVEBalanceChange(acc.NATIVE, predictedImpact);
      }

      if (predictedImpact.standard === ContractType.ERC20) {
        acc.ERC20 = computeERC20BalanceChange(acc.ERC20, predictedImpact);
      }

      if (predictedImpact.standard === ContractType.ERC721) {
        acc.ERC721 = computeERC712BalanceChange(acc.ERC721, predictedImpact);
      }

      if (predictedImpact.standard === ContractType.ERC1155) {
        acc.ERC1155 = computeERC1155BalanceChange(acc.ERC1155, predictedImpact);
      }

      return acc;
    },
    {}
  );

  if (balanceState.NATIVE) {
    const NATIVEBalanceState = balanceState.NATIVE;
    const senderAdresses = Object.keys(NATIVEBalanceState);

    for (let j = 0; j < senderAdresses.length; j++) {
      const senderAddress = senderAdresses[j];
      const delta = NATIVEBalanceState[senderAddress];
      if (!delta.isZero()) {
        balanceChanges.push({
          type: AssetType.NATIVE,
          address: senderAddress,
          delta: delta.toString(),
        });
      }
    }
  }

  if (balanceState.ERC20) {
    const ERC20BalanceState = balanceState.ERC20;
    const contractAddresses = Object.keys(ERC20BalanceState);

    for (let i = 0; i < contractAddresses.length; i++) {
      const contractAddress = contractAddresses[i];

      const senderAdresses = Object.keys(ERC20BalanceState[contractAddress]);

      for (let j = 0; j < senderAdresses.length; j++) {
        const senderAddress = senderAdresses[j];
        const delta = ERC20BalanceState[contractAddress][senderAddress];
        if (!delta.isZero()) {
          balanceChanges.push({
            type: AssetType.ERC20,
            address: senderAddress,
            contract: contractAddress,
            delta: delta.toString(),
          });
        }
      }
    }
  }

  if (balanceState.ERC721) {
    const ERC721BalanceState = balanceState.ERC721;
    const contractAddresses = Object.keys(ERC721BalanceState);

    for (let i = 0; i < contractAddresses.length; i++) {
      const contractAddress = contractAddresses[i];
      const senderAdresses = Object.keys(ERC721BalanceState[contractAddress]);

      for (let j = 0; j < senderAdresses.length; j++) {
        const senderAddress = senderAdresses[j];

        const { inbound, outbound } =
          ERC721BalanceState[contractAddress][senderAddress];
        if (inbound.length > 0 || outbound.length > 0) {
          balanceChanges.push({
            type: AssetType.ERC721,
            address: senderAddress,
            contract: contractAddress,
            outbound,
            inbound,
          });
        }
      }
    }
  }

  if (balanceState.ERC1155) {
    const ERC1155BalanceState = balanceState.ERC1155;
    const contractAddresses = Object.keys(ERC1155BalanceState);

    for (let i = 0; i < contractAddresses.length; i++) {
      const contractAddress = contractAddresses[i];

      const senderAdresses = Object.keys(ERC1155BalanceState[contractAddress]);

      for (let j = 0; j < senderAdresses.length; j++) {
        const senderAddress = senderAdresses[j];

        const typeIds = Object.keys(
          ERC1155BalanceState[contractAddress][senderAddress]
        );
        const amounts = typeIds.reduce(
          (acc: { id: string; delta: string }[], typeId) => {
            const delta =
              ERC1155BalanceState[contractAddress][senderAddress][typeId];

            if (!delta.isZero()) {
              acc.push({
                id: typeId,
                delta: delta.toString(),
              });
            }
            return acc;
          },
          []
        );

        if (amounts.length > 0) {
          balanceChanges.push({
            type: AssetType.ERC1155,
            address: senderAddress,
            contract: contractAddress,
            amounts,
          });
        }
      }
    }
  }

  return balanceChanges;
}
