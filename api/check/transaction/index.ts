import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Transaction } from "ethers";
import { getContractMetadata } from "../../../src/contractProber";
import { provider } from "../../../src/provider";
import {
  dryRun,
  generateBalanceChanges,
  getContractTypeRegistry,
  getPredictedImpactForEvent,
  getUniqueAddresses,
} from "../../../src/transaction";
import { handleNATIVE } from "../../../src/transaction/handlers/NATIVE";
import { BalanceChange } from "../../../src/types/BalanceChange";
import { ContractMetadata } from "../../../src/types/ContractType";
import { PredictedImpact } from "../../../src/types/PredictedImpact";

type CheckTransactionParams = {
  includeEvents: boolean,
  includeContracts: boolean,
  transaction: Transaction;
  rawtx: string;
};

type CheckTransactionResult = {
  success: boolean,
  events?: PredictedImpact[];
  balanceChanges?: BalanceChange[];
  contracts?: ContractMetadata[];
  error?: string,
  gasUsed?: number,
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Access-Control-Allow-Origin', '*')

  const { transaction, includeContracts, includeEvents } = request.body as CheckTransactionParams;

  try {
    const { events, calls, gas_used, success, error } = await dryRun(transaction);

    console.log(events.length, calls.length, gas_used, error)

    if (!success) {
      return response.status(200).send({
        success,
        error,
      });
    }

    console.log("Event count: ", events.length);

    const uniqueContractAddresses = getUniqueAddresses(
      events.map((event) => event.contract)
    );
    const contractTypeRegistry = await getContractTypeRegistry(
      uniqueContractAddresses
    );

    const eventPredictedImpacts = events
      .map((event) => {
        const contractType = contractTypeRegistry[event.contract];
        console.log("probed: ", event.contract, " for type: ", contractType);
        if (!contractType) {
          throw new Error(
            `No contract type in found in registry for ${event.contract}`
          );
        }
        return getPredictedImpactForEvent(
          contractTypeRegistry[event.contract],
          event
        );
      })
      .flat();

    const callPredictedImpacts = calls.map((call) => {
      return handleNATIVE(call)
    }).flat()

    const predictedImpacts = [
      ...eventPredictedImpacts,
      ...callPredictedImpacts,
    ]

    const balanceChanges = generateBalanceChanges(
      transaction,
      predictedImpacts
    );

    const result: CheckTransactionResult = {
      success,
      gasUsed: gas_used,
      balanceChanges,
    };

    if (includeEvents) {
      result.events = predictedImpacts;
    }

    if (includeContracts) {
      const contractMetadatasList = await Promise.all(
        uniqueContractAddresses.map((contractAddress) =>
          getContractMetadata(
            contractAddress,
            contractTypeRegistry[contractAddress],
            provider
          )
        )
      );
      result.contracts = contractMetadatasList;
    }

    return response.status(200).json(result);
  } catch (error) {
    console.error("error: ", error);

    if (error instanceof Error) {
      return response.status(500).send(error);
    }
    return response.status(500);
  }
}
