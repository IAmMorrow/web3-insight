import { z } from "zod"
import { schemaEIP712 } from "../validation/EIP712"

export type EIP712TypedMessage = z.infer<typeof schemaEIP712>;