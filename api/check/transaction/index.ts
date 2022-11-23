import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Transaction } from "ethers";
import { explorerProber } from "../../../src/contractProber/explorerProber";
import {
    dryRun,
    generateBalanceChanges,
    getContractMetadataRegistry,
    getPredictedImpactForEvent,
    getUniqueAddresses,
} from "../../../src/transaction";
import { handleNATIVE } from "../../../src/transaction/handlers/NATIVE";
import { BalanceChange } from "../../../src/types/BalanceChange";
import { ContractMetadata } from "../../../src/types/ContractType";
import { PredictedImpact } from "../../../src/types/PredictedImpact";

type CheckTransactionParams = {
  includeEvents: boolean;
  includeContracts: boolean;
  transaction: Transaction;
  rawtx: string;
};

type CheckTransactionResult = {
  success: boolean;
  events?: PredictedImpact[];
  balanceChanges?: BalanceChange[];
  contracts?: ContractMetadata[];
  error?: string;
  gasUsed?: number;
};

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method === "OPTIONS") {
        return response.status(200).json({
            body: "OK",
        });
    }

    const { transaction, includeContracts, includeEvents } =
    request.body as CheckTransactionParams;

    try {
        const { events, calls, gas_used, success, error } = await dryRun(
            transaction
        );

        if (!success) {
            return response.status(200).send({
                success,
                error,
            });
        }

        const uniqueContractAddresses = getUniqueAddresses(
            events.map((event) => event.contract)
        );

        const contractMetadatas = await explorerProber(uniqueContractAddresses);
        const contractTypeRegistry = await getContractMetadataRegistry(
            contractMetadatas
        );

        const eventPredictedImpacts = events
            .map((event) => {
                const contractMetadata = contractTypeRegistry[event.contract];
                if (!contractMetadata) {
                    throw new Error(
                        `No contract metadata in found in registry for ${event.contract}`
                    );
                }
                return getPredictedImpactForEvent(
                    contractTypeRegistry[event.contract].type,
                    event
                );
            })
            .flat();

        const callPredictedImpacts = calls
            .map((call) => {
                return handleNATIVE(call);
            })
            .flat();

        const predictedImpacts = [
            ...eventPredictedImpacts,
            ...callPredictedImpacts,
        ];

        const balanceChanges = generateBalanceChanges(
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
            result.contracts = contractMetadatas;
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
