import { ERC1155__factory } from "../../contracts";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc1155Interface = ERC1155__factory.createInterface();

export const handleERC1155: TransactionHandler = (event) => {
  const predictedImpacts: PredictedImpact[] = [];
  const logDescription = erc1155Interface.parseLog(event);

  switch (logDescription.name) {
    case "TransferBatch": {
      predictedImpacts.push({
        type: "ERC1155",
        contract: event.contract,
        event: "TransferBatch",
        operator: logDescription.args.operator,
        from: logDescription.args.from,
        to: logDescription.args.to,
        ids: logDescription.args.ids,
        amounts: logDescription.args.amounts,
      });
      break;
    }
    case "TransferSingle": {
      predictedImpacts.push({
        type: "ERC1155",
        contract: event.contract,
        event: "TransferSingle",
        operator: logDescription.args.operator,
        from: logDescription.args.from,
        to: logDescription.args.to,
        id: logDescription.args.id,
        amount: logDescription.args.amount,
      });
      break;
    }
    case "ApprovalForAll": {
      predictedImpacts.push({
        type: "ERC1155",
        contract: event.contract,
        event: "ApprovalForAll",
        owner: logDescription.args.owner,
        operator: logDescription.args.operator,
        approved: logDescription.args.approved,
      });
      break;
    }
  }

  return predictedImpacts;
};
