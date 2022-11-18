import { ERC1155PredictedImpact } from "../transaction/handlers/ERC1155";
import { ERC20PredictedImpact } from "../transaction/handlers/ERC20";
import { ERC721PredictedImpact } from "../transaction/handlers/ERC721";
import { NativePredictedImpact } from "../transaction/handlers/NATIVE";

export type PredictedImpact =
| ERC20PredictedImpact
| ERC721PredictedImpact
| ERC1155PredictedImpact
| NativePredictedImpact
