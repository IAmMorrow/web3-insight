import { z } from "zod";
import { schemaEIP712, schemaEIP712Type } from "../validation/EIP712";

export type EIP712TypedMessage = z.infer<typeof schemaEIP712>;
export type EIP712Type = z.infer<typeof schemaEIP712Type>;