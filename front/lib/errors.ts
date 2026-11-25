export class UnauthorizedError extends Error {
    constructor(message = "Non authentifié") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export class ApiError extends Error { 
    constructor(public status: number, message : string, public errors?: string[]){
        super(message);
        this.name = "ApiError";
    }
}