import { Transaction } from "ethers";
import { keccak256, serializeTransaction } from "ethers/lib/utils";
import { InternalError } from "../types/InternalError";

export function hashUnsignedTransaction(transaction: Transaction) {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        from,
        ...tx
    } = transaction;
    try {
        return keccak256(serializeTransaction(tx));
    } catch (error) {
        console.log(error);
        throw new InternalError("INVALID_TRANSACTION", "An invalid transaction object was provided.");
    }
}