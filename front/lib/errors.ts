export class UnauthorizedError extends Error {
    constructor(message = "Non authentifié") {
        super(message);
        this.name = "UnauthorizedError";
    }
}