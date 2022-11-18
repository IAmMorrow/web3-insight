export type ErrorType =
| "TRANSACTION_EXECUTION_REVERTED"
| "INVALID_TRANSACTION"
| "INVALID_EIP712_MESSAGE"

export class InternalError extends Error {
    type: string;
    message: string;
    data: unknown;

    constructor(type: ErrorType, message: string, data?: unknown) {
        super(message);
        this.name = "InternalError";
        this.type = type;
        this.message = message;
        this.data = data;
    }
}