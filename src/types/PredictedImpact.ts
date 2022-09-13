import { ERC1155PredictedImpact } from "../transaction/handlers/ERC1155"
import { ERC20PredictedImpact } from "../transaction/handlers/ERC20"
import { ERC721PredictedImpact } from "../transaction/handlers/ERC721"
import { SeaPortOrder } from "../typedMessage/handlers/SeaPort"

export type ERC20Permit = {
    type: "ERC20",
    action: "Permit",
    contract: string,
    owner: string,
    operator: string,
    amount: string,
    deadline: string,
}

export type PredictedImpact =
| ERC20PredictedImpact
| ERC721PredictedImpact
| ERC1155PredictedImpact
| ERC20Permit
| SeaPortOrder
