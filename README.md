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
| `origin` | no | `NEXTAUTH_URL` | Site origin used to build `callback` (see [Subdomains](#subdomains)) |
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

You must also leave `NEXTAUTH_URL` unset and set `AUTH_TRUST_HOST=true`:

```
AUTH_TRUST_HOST=true
```

`origin` only controls the `callback` this provider sends to accounts. Everything NextAuth builds itself — `redirect_uri`, the cookie domain, and the redirect to `callbackUrl` after sign-in — comes from its own base URL, which is `NEXTAUTH_URL` when that variable exists and the request host otherwise. So with `NEXTAUTH_URL=http://localhost:3000`, a user signing in on `iris-produksjon.localhost:3000` is sent back to `localhost:3000` after authorizing, where the session cookie does not exist.

The provider sets `AUTH_TRUST_HOST` for you, but that flag is only consulted when `NEXTAUTH_URL` is absent. Make sure whatever terminates TLS forwards `x-forwarded-host` and `x-forwarded-proto`.
