import { type } from "os";
import { z } from "zod";
import { PotentialImpact } from "../../types/PotentialImpact";
import { PredictedImpact } from "../../types/PredictedImpact";
import { schemaEIP712 } from "../../validation/EIP712";
import { TypedMessageHandler } from "../TypedMessageHandler";

type EIP2612Values = {
  owner?: string;
  spender?: string;
  value?: string;
  nonce?: string;
  deadline?: string;
};

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

export const handleEIP2612: TypedMessageHandler = (typedMessage) => {
  const potentialImpacts: PotentialImpact[] = [];

  const result = schemaEIP2612.safeParse(typedMessage);

  if (result.success) {
    const { domain, message } = result.data;

    potentialImpacts.push({
      standard: "ERC20",
      type: "Permit",
      contract: domain.verifyingContract,
      owner: message.owner,
      operator: message.spender,
      amount: message.value,
      deadline: message.deadline,
    });
  }
  return potentialImpacts;
};
