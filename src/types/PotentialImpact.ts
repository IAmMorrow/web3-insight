import { SeaPortOrder } from "../typedMessage/handlers/SeaPortOrder";

export type ERC20Permit = {
    type: "ERC20Permit",
    contract: string,
    owner: string,
    operator: string,
    amount: string,
    deadline: string,
}

export type PotentialImpact =
| ERC20Permit
| SeaPortOrder
