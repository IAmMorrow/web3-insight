import { EIP712TypedMessage } from "../types/EIP712"
import { PotentialImpact } from "../types/PotentialImpact"

export type TypedMessageHandler = (typedMessage: EIP712TypedMessage) => PotentialImpact[]