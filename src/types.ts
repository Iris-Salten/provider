export type IrisSaltenApiVersion = "v1" | (string & {});

export interface IrisSaltenProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface IrisSaltenProviderOptions {
    /**
     * Client name registered with Iris Salten accounts.
     * Sent as `name` on the authorize request.
     */
    name: string;
    /**
     * Accounts API version. Defaults to `"v1"`.
     */
    version?: IrisSaltenApiVersion;
    /**
     * NextAuth provider id. Callback path becomes
     * `/api/auth/callback/{id}`. Defaults to `"irissalten"`.
     */
    id?: string;
    /**
     * Display name on the default NextAuth sign-in page.
     * Defaults to `"Iris Salten"`.
     */
    label?: string;
    /**
     * Current site origin, e.g. `https://iris-produksjon.avfallsportalen.no`.
     * Used to build the `callback` sent to accounts.
     *
     * Pass this per request when tenants live on subdomains.
     * Falls back to `NEXTAUTH_URL`.
     */
    origin?: string;
    /**
     * Full callback URL. Overrides `origin` when set.
     */
    callback?: string;
    /**
     * Accounts host. Defaults to `https://accounts.iris-salten.no`.
     */
    issuer?: string;
    /**
     * Required by NextAuth OAuth providers. Not used by Iris Salten.
     * Falls back to `NEXTAUTH_SECRET`.
     */
    clientSecret?: string;
}
