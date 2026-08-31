import type { OAuthConfig } from "next-auth/providers/oauth";
import { decodeJwt } from "./decode-jwt";
import { resolveCallbackUrl, stripTrailingSlash } from "./origin";
import type { IrisSaltenProfile, IrisSaltenProviderOptions } from "./types";

const DEFAULT_ID = "irissalten";
const DEFAULT_VERSION = "v1";
const DEFAULT_ISSUER = "https://accounts.iris-salten.no";

function trustRequestHost() {
    process.env.AUTH_TRUST_HOST ??= "true";
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

    trustRequestHost();

    const callback = resolveCallbackUrl({
        callback: options.callback,
        origin: options.origin,
        providerId: id,
    });

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
