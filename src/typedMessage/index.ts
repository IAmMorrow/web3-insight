import { EIP712TypedMessage } from "../types/EIP712";
import { TypedMessageHandler } from "./types";

import { PotentialImpact } from "../types/PotentialImpact";
import { generateEIP712TypeIdentifier } from "./helpers";

// handlers
import { handleEIP2612 } from "./handlers/EIP2612";
import { handleSeaPortOrder } from "./handlers/SeaPortOrder";
import { handleDAIPermit } from "./handlers/DAIPermit";
import { z } from "zod";
import { InternalError } from "../types/InternalError";

const handlers: Record<TypedMessageHandler["identifier"], TypedMessageHandler> =
  {
      [handleSeaPortOrder.identifier]: handleSeaPortOrder,
      [handleEIP2612.identifier]: handleEIP2612,
      [handleDAIPermit.identifier]: handleDAIPermit,
  };

export function getPotentialImpactForTypedMessage(
    typedMessage: EIP712TypedMessage
) {
    const potentialImpacts: PotentialImpact[] = [];

    const identifier = generateEIP712TypeIdentifier(typedMessage.types);

    const handlerConfig = handlers[identifier];

    if (handlerConfig) {
        const { handler } = handlerConfig;

        try {
            const impacts = handler(typedMessage);

            if (impacts.length) {
                potentialImpacts.push(...impacts);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new InternalError("INVALID_EIP712_MESSAGE", `Invalid "${handlerConfig.name}" typed message`, error.flatten());
            }
            throw error;
        }
    }

    return {
        potentialImpacts,
        type: handlerConfig ? handlerConfig.name : "unknown",
    };
}
