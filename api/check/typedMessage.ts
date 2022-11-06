import type { VercelRequest, VercelResponse } from "@vercel/node";
import { EIP712TypedMessage } from "../../src/types/EIP712";
import { getPotentialImpactForTypedMessage } from "../../src/typedMessage";
import { z } from "zod";
import { schemaEIP712 } from "../../src/validation/EIP712";


type CheckTypedMessageParams = {
  address: string;
  typedData: EIP712TypedMessage;
};

const schemaCheckTypedMessage = z.object({
  typedMessage: schemaEIP712,
})

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "OPTIONS") {
    return response.status(200).json({
      body: "OK",
    });
  }

  try {
    const { typedMessage } = schemaCheckTypedMessage.parse(request.body);

    const potentialImpacts = getPotentialImpactForTypedMessage(typedMessage);
    return response.status(200).json(potentialImpacts);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(500).send(error.format());
    }

    if (error instanceof Error) {
      return response.status(500).send(error.message);
    }
    return response.status(500);
  }
}
