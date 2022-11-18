import { z } from "zod";
import { PotentialImpact } from "../../../types/PotentialImpact";
import { schemaEIP712 } from "../../../validation/EIP712";
import { generateEIP712TypeIdentifier } from "../../helpers";
import { TypedMessageHandler } from "../../types";
import rawType from "./type.json";

const schemaEIP2612 = schemaEIP712.extend({
    primaryType: z.literal("Permit"),
    domain: z.object({
        name: z.string(),
        version: z.literal(1),
        chainId: z.number(),
        verifyingContract: z.string(),
    }),
    message: z.object({
        owner: z.string(),
        spender: z.string(),
        value: z.string(),
        nonce: z.number(),
        deadline: z.string(),
    }),
});

export const handleEIP2612: TypedMessageHandler = {
    handler: (typedMessage) => {
        const potentialImpacts: PotentialImpact[] = [];
    
        const { domain, message } = schemaEIP2612.parse(typedMessage);
        
        potentialImpacts.push({
            type: "ERC20Permit",
            contract: domain.verifyingContract,
            owner: message.owner,
            operator: message.spender,
            amount: message.value,
            deadline: message.deadline,
        });
        return potentialImpacts;
    },
    identifier: generateEIP712TypeIdentifier(rawType),
    name: "EIP2612"
};
