import { EIP712Type, EIP712TypedMessage } from "../types/EIP712";
import crypto from "crypto";
import { TypedDataEncoder } from "@ethersproject/hash/lib/typed-data";
import { InternalError } from "../types/InternalError";

// This method takes the "type" part of a EIP712TypedMessage and generate an identifier out of it
export function generateEIP712TypeIdentifier(typeStructure: EIP712Type): string {
    const sortedTypeNames = Object.keys(typeStructure).sort((a, b) => a.localeCompare(b));

    const sortedTypes = sortedTypeNames.map(typeName => {
        const currentTypeDef = typeStructure[typeName];

        if (currentTypeDef) {
            return {
                name: typeName,
                value: currentTypeDef.sort((a, b) => a.name.localeCompare(b.name)),
            };
        }
    });

    const serializedTypes = JSON.stringify(sortedTypes);

    const md5sum = crypto.createHash("md5");
    return md5sum.update(serializedTypes).digest("hex");
}

export function hashEIP712TypedMessage(typedMessage: EIP712TypedMessage) {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        EIP712Domain,
        ...types
    } = typedMessage.types;

    try {
        return TypedDataEncoder.hash(typedMessage.domain, types, typedMessage.message);
    } catch (error) {
        throw new InternalError("INVALID_EIP712_MESSAGE", "Could not verify the message with the provided types.");
    }
}