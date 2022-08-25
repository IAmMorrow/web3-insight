import { type } from "os";
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
    const predictedImpacts: PredictedImpact[] = [];

    const {
        domain,
        message,
        primaryType,
    } = typedMessage;

    if (primaryType === "Permit" && domain.verifyingContract && domain.chainId) {
        const permitValues = message as EIP2612Values;

        if (permitValues.deadline && permitValues.nonce && permitValues.owner && permitValues.spender && permitValues.value) {
            predictedImpacts.push({
                type: "ERC20",
                action: "Permit",
                contract: domain.verifyingContract,
                owner: permitValues.owner,
                operator: permitValues.spender,
                amount: permitValues.value,
                deadline: permitValues.deadline,
            })
        }
    }

    return predictedImpacts;
}
