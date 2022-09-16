import type { VercelRequest, VercelResponse } from "@vercel/node";
import EIP712JsonSchema from "../../src/schemas/eip712.json";
import Ajv from "ajv";
import { EIP712TypedMessage } from "../../src/types/EIP712";
import { getPotentialImpactForTypedMessage } from "../../src/typedMessage";

const ajv = new Ajv();
const validateEIP712 = ajv.compile(EIP712JsonSchema);

type CheckTypedMessageParams = {
  address: string;
  typedData: EIP712TypedMessage;
};

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "OPTIONS") {
    return response.status(200).json({
      body: "OK",
    });
  }
  const { address, typedData } = request.body as CheckTypedMessageParams;

  try {
    const valid = validateEIP712(typedData);
    if (!valid) {
      console.error(validateEIP712.errors);
      throw new Error(`Invalid EIP712 TypedData: ${validateEIP712.errors}`);
    }

    const potentialImpacts = getPotentialImpactForTypedMessage(typedData);
    return response.status(200).json(potentialImpacts);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(500).send(error.message);
    }
    return response.status(500);
  }
}
