import { TypedDataDomain, TypedDataField } from "ethers"

export type EIP712TypedMessage = {
    types: {
        EIP712Domain: TypedDataField[],
        [name: string]: TypedDataField[]
    },
    primaryType: string,
    domain: TypedDataDomain,
    message: {
        [name: string]: unknown,
    }
}
