import { EIP712TypedMessage } from "../types/EIP712"
import { PredictedImpact } from "../types/PredictedImpact"

export type TypedMessageHandler = (typedMessage: EIP712TypedMessage) => PredictedImpact[]