import type { OAuthConfig } from "next-auth/providers/oauth";
import { decodeJwt } from "./decode-jwt";
import { resolveCallbackUrl, stripTrailingSlash } from "./origin";
import type { IrisSaltenProfile, IrisSaltenProviderOptions } from "./types";

const DEFAULT_ID = "irissalten";
const DEFAULT_VERSION = "v1";
const DEFAULT_ISSUER = "https://accounts.iris-salten.no";

let hostMismatchWarned = false;

function trustRequestHost(callback?: string) {
    process.env.AUTH_TRUST_HOST ??= "true";

    const fixedUrl = process.env.NEXTAUTH_URL;

    if (hostMismatchWarned || !fixedUrl || !callback) {
        return;
    }

    // NextAuth reads NEXTAUTH_URL before it looks at AUTH_TRUST_HOST, so a fixed
    // value silently overrides the per-request host on every redirect it builds.
    if (!callback.startsWith(`${stripTrailingSlash(fixedUrl)}/`)) {
        hostMismatchWarned = true;

        console.warn(
            `[iris-salten] NEXTAUTH_URL is set to "${fixedUrl}" but this request resolved to "${callback}". NextAuth will redirect back to NEXTAUTH_URL. Unset NEXTAUTH_URL and keep AUTH_TRUST_HOST=true to support multiple hosts.`,
        );
    }
}

export default function IrisSaltenProvider(options: IrisSaltenProviderOptions) {
    const {
        name,
        version = DEFAULT_VERSION,
        id = DEFAULT_ID,
        label = "Iris Salten",
        issuer = DEFAULT_ISSUER,
        clientSecret = process.env.NEXTAUTH_SECRET ?? "unused",
    } = options;

    if (!name) {
        throw new Error('IrisSaltenProvider requires a "name" option.');
    }

    const callback = resolveCallbackUrl({
        callback: options.callback,
        origin: options.origin,
        providerId: id,
    });

    trustRequestHost(callback);

    return {
        id,
        name: label,
        type: "oauth" as const,
        clientId: name,
        clientSecret,
        checks: ["none"] as const,
        authorization: {
            url: `${stripTrailingSlash(issuer)}/${version}/authorize`,
            params: {
                name,
                ...(callback ? { callback } : {}),
            },
        },
        token: {
            request: async ({ params }: { params: Record<string, unknown> }) => {
                const code =
                    typeof params.code === "string" ? params.code : undefined;

                if (!code) {
                    throw new Error("Missing authorization code");
                }

                return {
                    tokens: {
                        access_token: code,
                        token_type: "bearer",
                    },
                };
            },
        },
        userinfo: {
            request: async ({ tokens }: { tokens: { access_token?: string } }) => {
                if (!tokens.access_token) {
                    throw new Error("Missing access token");
                }

                return decodeJwt<IrisSaltenProfile>(tokens.access_token);
            },
        },
        profile(profile: IrisSaltenProfile) {
            return {
                id: profile.id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                name: `${profile.firstName} ${profile.lastName}`.trim(),
            };
        },
    } satisfies OAuthConfig<IrisSaltenProfile>;
}
