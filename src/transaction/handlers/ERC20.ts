import { ERC20__factory } from "../../contracts";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TransactionHandler } from "../TransactionHandler";

const erc20Interface = ERC20__factory.createInterface();

export const handleERC20: TransactionHandler = (event) => {
  const predictedImpacts: PredictedImpact[] = [];
  const logDescription = erc20Interface.parseLog(event);

  switch (logDescription.name) {
    case "Transfer": {
      predictedImpacts.push({
        type: "ERC20",
        contract: event.contract,
        event: "Transfer",
        from: logDescription.args.from,
        to: logDescription.args.to,
        amount: logDescription.args.amount,
      });
      break;
    }
    case "Approval": {
      predictedImpacts.push({
        type: "ERC20",
        contract: event.contract,
        event: "Approval",
        owner: logDescription.args.owner,
        operator: logDescription.args.operator,
        amount: logDescription.args.amount,
      });
      break;
    }
  }

  return predictedImpacts;
};
