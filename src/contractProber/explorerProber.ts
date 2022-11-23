import axios from "axios";
import { z } from "zod";
import { ContractMetadata, ContractType } from "../types/ContractType";

const schemaContractProberERC20Result = z.object({
    contract: z.string(),
    standard: z.literal("ERC20"),
    data: z.object({
        name: z.string(),
        symbol: z.string(),
        decimals: z.number(),
    }),
});

const schemaContractProberERC1155Result = z.object({
    contract: z.string(),
    standard: z.literal("ERC1155"),
});

const schemaContractProberERC721Result = z.object({
    contract: z.string(),
    standard: z.literal("ERC721"),
    data: z.object({
        name: z.string(),
        symbol: z.string(),
    }),
});

const schemaContractProberNoneResult = z.object({
    contract: z.string(),
    standard: z.literal("None"),
});

const schemaContractProberResult = z.array(
    z.discriminatedUnion("standard", [
        schemaContractProberERC20Result,
        schemaContractProberERC1155Result,
        schemaContractProberERC721Result,
        schemaContractProberNoneResult,
    ])
);

export async function explorerProber(addresses: string[]): Promise<ContractMetadata[]> {
    if (!process.env.EXPLORER_URL) {
        throw new Error("env EXPLORER_URL not defined");
    }

    const { data } = await axios.post(
        `${process.env.EXPLORER_URL}/blockchain/v4/eth/contract/probe`,
        addresses
    );

    const safeContractProverResult = schemaContractProberResult.safeParse(data);

    if (!safeContractProverResult.success) {
        throw new Error(
            `Explorers API returned unexpected data: ${safeContractProverResult.error.message}`
        );
    }

    const results = safeContractProverResult.data;

    return results.map((contractData) => {
        switch (contractData.standard) {
        case "ERC20": {
            return {
                type: ContractType.ERC20,
                address: contractData.contract,
                symbol: contractData.data.symbol,
                name: contractData.data.name,
                decimals: contractData.data.decimals,
            };
        }
        case "ERC721": {
            return {
                type: ContractType.ERC721,
                address: contractData.contract,
                symbol: contractData.data.symbol,
                name: contractData.data.name,
            };
        }
        case "ERC1155": {
            return {
                type: ContractType.ERC1155,
                address: contractData.contract,
            };
        }
        case "None": {
            return {
                type: ContractType.UNKNOWN,
                address: contractData.contract,
            };
        }
        }
    });
}
