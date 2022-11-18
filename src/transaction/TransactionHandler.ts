import { PredictedImpact } from "../types/PredictedImpact";
import { DebugTraceCallResult } from "../types/Tracer";

export type TransactionHandler = (event: DebugTraceCallResult) => PredictedImpact[]