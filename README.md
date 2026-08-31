# @iris-salten/provider

NextAuth provider for [Iris Salten accounts](https://accounts.iris-salten.no).

The accounts service is not a standard OAuth token exchange. After the user authorizes, it redirects back with `?code=<JWT>`. This provider treats that JWT as the user session token and reads `id`, `firstName`, `lastName`, and `email` from it.

## Install

```bash
npm install @iris-salten/provider next-auth
```

## Usage

```ts
import NextAuth from "next-auth";
import IrisSaltenProvider from "@iris-salten/provider";

export const authOptions = {
    providers: [
        IrisSaltenProvider({
            name: "Avfallsportalen",
        }),
    ],
};

export default NextAuth(authOptions);
```

Sign in with:

```ts
import { signIn } from "next-auth/react";

await signIn("irissalten", { callbackUrl: "/dashboard" });
```

Register this callback URL with Iris Salten accounts:

```
{NEXTAUTH_URL}/api/auth/callback/irissalten
```

### Options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `name` | yes | | Client name sent to `/authorize` |
| `version` | no | `"v1"` | Accounts API version |
| `id` | no | `"irissalten"` | NextAuth provider id (callback path) |
| `label` | no | `"Iris Salten"` | Label on the default sign-in page |
| `origin` | no | `NEXTAUTH_URL` | Site origin used to build `callback` |
| `callback` | no | `{origin}/api/auth/callback/{id}` | Full callback URL |
| `issuer` | no | `https://accounts.iris-salten.no` | Accounts host |
| `clientSecret` | no | `NEXTAUTH_SECRET` | Unused by Iris Salten, required by NextAuth |

### Subdomains

If tenants live on subdomains, pass the request origin so `callback` keeps the host:

```ts
IrisSaltenProvider({
    name: "Avfallsportalen",
    origin: "https://iris-produksjon.avfallsportalen.no",
});
```

The provider also sets `AUTH_TRUST_HOST` so NextAuth itself uses the request host instead of a fixed `NEXTAUTH_URL`.
