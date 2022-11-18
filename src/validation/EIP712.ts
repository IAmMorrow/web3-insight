import { z } from "zod";

export const schemaVarType = z.object({
    name: z.string(),
    type: z.string(),
});

export const schemaEIP712Type = z.intersection(
    z.object({
        EIP712Domain: z.array(schemaVarType),
    }),
    z.record(z.string(), z.array(schemaVarType))
);

export const schemaEIP712 = z.object({
    types: schemaEIP712Type,
    primaryType: z.string(),
    domain: z.object({}).passthrough(),
    message: z.object({}).passthrough(),
});
