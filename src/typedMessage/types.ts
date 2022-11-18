import { EIP712TypedMessage } from "../types/EIP712";
import { PotentialImpact } from "../types/PotentialImpact";

export type TypedMessageHandler = {
    name: string,
    handler: (typedMessage: EIP712TypedMessage) => PotentialImpact[],
    identifier: string,
}