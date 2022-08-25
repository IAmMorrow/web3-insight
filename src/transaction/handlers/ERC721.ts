import { ERC721__factory } from "../../contracts";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc721Interface = ERC721__factory.createInterface();

export const handleERC721: TransactionHandler = (event) => {
  const predictedImpacts: PredictedImpact[] = [];
  const logDescription = erc721Interface.parseLog(event);

  switch (logDescription.name) {
    case "Transfer": {
      predictedImpacts.push({
        type: "ERC721",
        contract: event.contract,
        event: "Transfer",
        from: logDescription.args.from,
        to: logDescription.args.to,
        tokenId: logDescription.args.tokenId,
      });
      break;
    }
    case "Approval": {
      predictedImpacts.push({
        type: "ERC721",
        contract: event.contract,
        event: "Approval",
        owner: logDescription.args.owner,
        operator: logDescription.args.operator,
        tokenId: logDescription.args.tokenId,
      });
      break;
    }
    case "ApprovalForAll": {
      predictedImpacts.push({
        type: "ERC721",
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
