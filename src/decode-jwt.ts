export function decodeJwt<T>(token: string): T {
    const payload = token.split(".")[1];

    if (!payload) {
        throw new Error("Invalid JWT");
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
}
