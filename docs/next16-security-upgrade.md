# Next.js 16 security upgrade

Verified: 2026-09-15

This branch upgrades the existing static-export website from Next.js 14 to
Next.js 16.3.3. It does not add the SMS opt-in page or connect any consent API.

## Runtime and dependency floor

- Node.js: `>=20.9.0`, enforced through `package.json#engines`.
- Next.js: 16.3.3.
- React and React DOM: 19.2.8.
- PostCSS: 8.5.23.
- nanoid: 3.3.19 in the resolved transitive graph.
- ESLint: 9.39.5 with `eslint-config-next` 16.3.3 and flat configuration.

Use the repository's lockfile-driven installation method for CI and local
verification:

```sh
npm ci
```

The local verification environment used Node.js 26.8.1. The existing
development-only `@vercel/node` graph emitted an engine warning because one of
its transitive tools currently declares support for Node 20, 22, and 24 rather
than Node 26. Use a supported Node LTS release for CI and preview validation.
The registry also marks ESLint 9.39.5 deprecated now that the ESLint 9 support
window has ended; this branch retains ESLint 9 for the requested Next.js 16
flat-config migration. A later ESLint 10 change should be compatibility-tested
separately.

## Static export and redirect behavior

`output: 'export'` remains enabled. Next.js documents Proxy and Next-config
redirects as unsupported for static export, so the old `src/middleware.ts`
host redirect could not affect the generated `out` deployment.

Read-only production header checks on 2026-09-15 found:

| URL | Result |
| --- | --- |
| `https://mymedvisit.app/` | `200`, no redirect |
| `https://www.mymedvisit.app/` | `200`, no redirect |
| `https://mymedvisit.app/sms-opt-in` | `404`, no redirect |
| `https://www.mymedvisit.app/sms-opt-in` | `404`, no redirect |

The apex and `www` responses also had matching content ETags for each tested
path. Repository `vercel.json` contains no host redirect. Removing the
unsupported middleware therefore preserves the effective deployed behavior:
both hosts serve content directly. Any future single-canonical-host redirect
must be an explicit hosting-layer change with separate review; it cannot be
implemented by Next.js Proxy while static export is retained.

## Webpack selection and Turbopack follow-up

Next.js 16 defaults to Turbopack. This repository previously supplied a custom
Webpack callback only to recreate the `@/*` alias already declared in
`tsconfig.json`; that callback has been removed.

The build and development scripts select Next.js 16's supported `--webpack`
mode explicitly. This keeps the framework/security upgrade separate from a
bundler migration and provides a verified production build in the current
environment. A default Turbopack build was attempted, but its PostCSS worker
could not bind an internal loopback port in the restricted validation
environment; this was an environment-level failure before application
compilation, not an identified application incompatibility.

The eventual Turbopack follow-up should:

1. run `next dev` and `next build` without `--webpack` on a supported Node LTS
   runner that permits Turbopack's local worker communication;
2. compare generated route, HTML, CSS, and asset output with the verified
   Webpack static export;
3. rerun TypeScript, ESLint, production audit, and all application tests; and
4. remove the explicit flags only after CI and preview verification pass.

## Audit and CI policy

`npm audit --omit=dev` reports zero vulnerabilities. The prior Next.js,
PostCSS, nanoid, and baseline-browser-mapping findings are absent from the
production graph.

A full audit reports 14 development-only package findings: 11 high, two
moderate, and one low, with no critical finding. The direct development
dependency `@vercel/node` accounts for the Vercel build-tool chain findings
through `@vercel/build-utils`, `@vercel/python-analysis`,
`@vercel/static-config`, AJV, js-yaml, minimatch, path-to-regexp, smol-toml,
and undici. The remaining development findings are in brace-expansion,
Browserslist, picomatch, and postcss-selector-parser. They are not suppressed.

This repository has no checked-in GitHub Actions workflow or audit script;
`vercel.json` runs `npm install` and `npm run build`, neither of which fails on
the current audit warnings. An organization- or platform-level policy not
stored in this repository must be checked separately. Remediation of the
Vercel build-tool graph should be isolated from this framework upgrade.

With npm 11, `npm ci` also reports three install scripts awaiting an explicit
allow/deny policy: esbuild, optional fsevents, and development-only
unrs-resolver. Installation exits successfully and this branch does not modify
that repository policy.

## Sharp and libvips

Next.js declares Sharp as optional. The lockfile therefore contains Sharp
0.35.4 and platform-specific libvips packages even though the application does
not import `next/image` or Sharp.

The verified static deployment artifact is `out/`. It contains no Sharp,
libvips, or native `.node` files. Those packages are present in the install
tree and Next.js server build trace, but are not redistributed in the static
artifact. If a future deployment packages `.next`, `node_modules`, or a server
trace instead of only `out`, the disposition must be reviewed again.

The platform libvips packages declare `LGPL-3.0-or-later`; some platform Sharp
packages carry combined Apache-2.0/LGPL notices. If those binaries are ever
redistributed, the project should preserve the applicable license and
copyright notices, provide required license text, and have counsel determine
any source/relocation obligations for the exact distribution model. This note
records package metadata and is not legal advice.
