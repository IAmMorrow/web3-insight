import { ethers } from "ethers";
import { z } from "zod";
import { PotentialImpact } from "../../../types/PotentialImpact";
import { schemaEIP712 } from "../../../validation/EIP712";
import { generateEIP712TypeIdentifier } from "../../helpers";
import { TypedMessageHandler } from "../../types";
import rawType from "./type.json";

const schemaDAIPermit = schemaEIP712.extend({
    primaryType: z.literal("Permit"),
    domain: z.object({
        name: z.string(),
        version: z.literal("1"),
        chainId: z.number(),
        verifyingContract: z.string(),
    }),
    message: z.object({
        holder: z.string(),
        spender: z.string(),
        nonce: z.number(),
        expiry: z.string(),
        allowed: z.boolean(),
    }),
});

export const handleDAIPermit: TypedMessageHandler = {
    handler: (typedMessage) => {
        const potentialImpacts: PotentialImpact[] = [];
    
        const { domain, message } = schemaDAIPermit.parse(typedMessage);
        
        potentialImpacts.push({
            type: "ERC20Permit",
            contract: domain.verifyingContract,
            owner: message.holder,
            operator: message.spender,
            amount: message.allowed ? ethers.constants.MaxUint256.toString() : "0",
            deadline: message.expiry,
        });
        return potentialImpacts;
    },
    identifier: generateEIP712TypeIdentifier(rawType),
    name: "DAIPermit",
};
