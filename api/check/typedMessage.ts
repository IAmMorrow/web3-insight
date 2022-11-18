import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPotentialImpactForTypedMessage } from "../../src/typedMessage";
import { z } from "zod";
import { schemaEIP712 } from "../../src/validation/EIP712";
import { PotentialImpact } from "../../src/types/PotentialImpact";
import { InternalError } from "../../src/types/InternalError";
import { hashEIP712TypedMessage } from "../../src/typedMessage/helpers";

const schemaCheckTypedMessageQuery = z.object({
    typedMessage: schemaEIP712,
});

type CheckTypedMessageResultSuccess = {
  success: true,
  messageType: string,
  potentialImpacts: PotentialImpact[],
  messageHash: string,
}

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
        const safeParseResult = schemaCheckTypedMessageQuery.safeParse(request.body);

        if (!safeParseResult.success) {
            throw new InternalError("INVALID_EIP712_MESSAGE", "Invalid EIP-712 Typed Message provided", safeParseResult.error.flatten());
        }

        const { typedMessage } = safeParseResult.data; 

        const hash = hashEIP712TypedMessage(typedMessage);

        const {
            potentialImpacts,
            type,
        } = getPotentialImpactForTypedMessage(typedMessage);

        const result: CheckTypedMessageResultSuccess = {
            success: true,
            messageType: type,
            potentialImpacts,
            messageHash: hash,
        };
        return response.status(200).json(result);
    } catch (error) {
        if (error instanceof InternalError) {
            return response.status(200).send({
                success: false,
                error,
            });
        }
        if (error instanceof z.ZodError) {
            return response.status(500).send(error.format());
        }

        if (error instanceof Error) {
            return response.status(500).send(error.message);
        }
        return response.status(500).send("unknown error");
    }
}
