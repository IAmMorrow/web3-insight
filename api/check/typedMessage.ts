import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";
import EIP712JsonSchema from "../../src/schemas/eip712.json"
import Ajv from "ajv";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { EIP712TypedMessage } from "../../src/types/EIP712";
import { PredictedImpact } from "../../src/types/PredictedImpact";
import { getPredictedImpactForTypedMessage } from "../../src/typedMessage";

const ajv = new Ajv();
const validateEIP712 = ajv.compile(EIP712JsonSchema);

type CheckTypedMessageParams = {
  address: string,
  typedData: EIP712TypedMessage
}

export default function handler(request: VercelRequest, response: VercelResponse) {
    const { address, typedData } = request.body as CheckTypedMessageParams;

    const predictedImpacts: PredictedImpact[] = [];

    try {
        const valid = validateEIP712(typedData);
        if (!valid) {
          valid
          console.error(validateEIP712.errors)
          throw new Error(`Invalid EIP712 TypedData: ${validateEIP712.errors}`);
        }
        
        const predictedImpacts = getPredictedImpactForTypedMessage(typedData);
        return response.status(200).json(predictedImpacts);
    } catch (error) {
        if (error instanceof Error) {
            return response.status(500).send(error.message);
        }
        return response.status(500);
    }
};
