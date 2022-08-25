import { EIP712TypedMessage } from "../types/EIP712";
import { PredictedImpact } from "../types/PredictedImpact";
import { TypedMessageHandler } from "./TypedMessageHandler";

// handlers
import { handleEIP2612 } from "./handlers/EIP2612";
import { handleSeaPort } from "./handlers/SeaPort";


const handlers: TypedMessageHandler[] = [
    handleEIP2612,
    handleSeaPort,
]

export function getPredictedImpactForTypedMessage(typedMessage: EIP712TypedMessage) {
    const predictedImpacts: PredictedImpact[] = [];

    for (let i = 0; i < handlers.length; i++) {
        const currentHandler = handlers[i];
        const impacts = currentHandler(typedMessage);

        if (impacts.length) {
            predictedImpacts.push(...impacts)
        }
    }

    return predictedImpacts;
}