import { type } from "os";
import { PotentialImpact } from "../../types/PotentialImpact";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TypedMessageHandler } from "../TypedMessageHandler";

type EIP2612Values = {
    owner?: string,
    spender?: string,
    value?: string,
    nonce?: string,
    deadline?: string,
}

export const handleEIP2612: TypedMessageHandler = (typedMessage) => {
    const potentialImpacts: PotentialImpact[] = [];

    const {
        domain,
        message,
        primaryType,
    } = typedMessage;

    if (primaryType === "Permit" && domain.verifyingContract && domain.chainId) {
        const permitValues = message as EIP2612Values;

        if (permitValues.deadline && permitValues.nonce && permitValues.owner && permitValues.spender && permitValues.value) {
            potentialImpacts.push({
                standard: "ERC20",
                type: "Permit",
                contract: domain.verifyingContract,
                owner: permitValues.owner,
                operator: permitValues.spender,
                amount: permitValues.value,
                deadline: permitValues.deadline,
            })
        }
    }

    return potentialImpacts;
}
