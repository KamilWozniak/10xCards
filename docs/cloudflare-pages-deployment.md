# Deploying to Cloudflare Pages

This document outlines the steps to deploy the 10xCards application to Cloudflare Pages.

## Configuration Files

The following configuration files have been added to the project:

1. `wrangler.toml` - Main configuration file for Cloudflare Workers/Pages
2. `.cloudflare/pages.toml` - Cloudflare Pages specific configuration
3. `.node-version` - Specifies Node.js version for the build environment
4. `nuxt.config.cloudflare.ts` - Nuxt configuration with Cloudflare Pages preset (`cloudflare_pages`)

## Deployment Settings

When setting up the project in Cloudflare Pages dashboard:

1. Connect your GitHub repository
2. Configure build settings:
   - Framework preset: Nuxt
   - Build command: `pnpm install --no-frozen-lockfile && pnpm run build:cloudflare`
   - Build output directory: `.output/public`
   - Node.js version: 22

## Environment Variables

Add the following environment variables in the Cloudflare Pages dashboard:

- `NUXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NUXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NUXT_OPENROUTER_API_KEY` - Your OpenRouter API key (if using OpenRouter)

## Troubleshooting

If you encounter build issues:

1. **Dependency mismatches**: The configuration uses `--no-frozen-lockfile` to ensure dependencies are installed correctly even if the lockfile is out of sync.

2. **Build failures**: Check the build logs in the Cloudflare Pages dashboard for specific errors.

3. **Runtime errors**: Check the Functions logs in the Cloudflare Pages dashboard.

4. **Crypto API issues**: The application uses Web Crypto API instead of Node.js crypto for Cloudflare compatibility. If you see `crypto.createHash is not implemented` errors, ensure all crypto operations use the Web Crypto API (`crypto.subtle`).

## Local Testing

To test the Cloudflare Pages setup locally:

```bash
# Install wrangler CLI
npm install -g wrangler

# Preview the build
wrangler pages dev .output/public
```
