import { SeaPortOrder } from "../typedMessage/handlers/SeaPort"

export type ERC20Permit = {
    standard: "ERC20",
    type: "Permit",
    contract: string,
    owner: string,
    operator: string,
    amount: string,
    deadline: string,
}

export type PotentialImpact =
| ERC20Permit
| SeaPortOrder
