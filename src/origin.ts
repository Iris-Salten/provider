export function stripTrailingSlash(value: string) {
    return value.replace(/\/$/, "");
}

export function resolveOrigin(origin?: string) {
    const resolved = origin?.trim() || process.env.NEXTAUTH_URL || "";
    return stripTrailingSlash(resolved);
}

export function resolveCallbackUrl(options: {
    callback?: string;
    origin?: string;
    providerId: string;
}) {
    if (options.callback) {
        return options.callback;
    }

    const origin = resolveOrigin(options.origin);

    if (!origin) {
        return undefined;
    }

    return `${origin}/api/auth/callback/${options.providerId}`;
}
