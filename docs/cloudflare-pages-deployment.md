# Deploying to Cloudflare Pages

This document outlines the deployment process for the 10xCards application to Cloudflare Pages using **GitHub Actions** for automated CI/CD.

## Deployment Overview

The project uses **GitHub Actions** for automated deployment with the following workflow:

1. **Automated Testing**: Every pull request triggers linting, unit tests, and E2E tests
2. **Automated Deployment**: Pushes to `master` branch automatically deploy to production
3. **Manual Deployment**: Manual deployment option via GitHub Actions interface

## Configuration Files

The following configuration files support the deployment:

1. **`.github/workflows/master.yml`** - Main deployment workflow
2. **`.github/workflows/pull-request.yml`** - PR testing workflow  
3. **`.github/actions/setup-node-pnpm/action.yml`** - Reusable setup action
4. **`wrangler.toml`** - Cloudflare Workers/Pages configuration
5. **`.nvmrc`** - Node.js version specification (v22)
6. **`nuxt.config.cloudflare.ts`** - Nuxt configuration with Cloudflare Pages preset

## GitHub Actions Setup

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

```env
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id  
CLOUDFLARE_PROJECT_NAME=your_project_name

# Application Environment Variables
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Deployment Workflow

The master deployment workflow (`.github/workflows/master.yml`) includes:

1. **Lint Job**: ESLint code quality checks
2. **Unit Test Job**: Vitest unit tests with coverage
3. **Build Job**: Cloudflare-optimized build using `pnpm build:cloudflare`
4. **Deploy Job**: Automated deployment to Cloudflare Pages using Wrangler
5. **Status Notification**: Deployment success/failure notifications

### Build Configuration

- **Node.js Version**: 22 (latest LTS)
- **Package Manager**: pnpm v9
- **Build Command**: `pnpm build:cloudflare`
- **Output Directory**: `dist/` (not `.output/public`)
- **Cloudflare Preset**: `cloudflare-pages`

## Manual Deployment (Alternative)

If you prefer manual deployment without GitHub Actions:

1. **Connect Repository**: Link your GitHub repository to Cloudflare Pages
2. **Configure Build Settings** in Cloudflare Pages dashboard:
   - Framework preset: Nuxt
   - Build command: `pnpm install --frozen-lockfile && pnpm build:cloudflare`
   - Build output directory: `dist`
   - Node.js version: 22

## Environment Variables

Environment variables are automatically configured through GitHub Secrets during automated deployment. For manual deployment, add these in the Cloudflare Pages dashboard:

- `NUXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NUXT_PUBLIC_SUPABASE_KEY` - Your Supabase anonymous key  
- `OPENROUTER_API_KEY` - Your OpenRouter API key

## Deployment Triggers

### Automatic Deployment
- **Production**: Push to `master` branch
- **Preview**: Create pull request (testing only, no deployment)

### Manual Deployment
- Navigate to **Actions** tab in GitHub repository
- Select **Master Deployment** workflow
- Click **Run workflow** button

## Troubleshooting

### GitHub Actions Issues

1. **Action Failures**: Check the Actions tab in your GitHub repository for detailed logs
2. **Secret Configuration**: Ensure all required secrets are properly configured
3. **Permission Issues**: Verify GitHub Actions has necessary permissions

### Build Issues

1. **Dependency Issues**: The workflow uses `--frozen-lockfile` for consistent builds
2. **Node.js Version**: Ensure `.nvmrc` specifies Node.js 22
3. **Build Output**: Verify build creates `dist/` directory (not `.output/public`)

### Cloudflare Issues

1. **API Token**: Ensure Cloudflare API token has Pages:Edit permissions
2. **Project Name**: Verify `CLOUDFLARE_PROJECT_NAME` matches your Cloudflare Pages project
3. **Account ID**: Check that `CLOUDFLARE_ACCOUNT_ID` is correct

### Runtime Errors

1. **Functions Logs**: Check Cloudflare Pages Functions logs for runtime errors
2. **Crypto API**: Application uses Web Crypto API for Cloudflare compatibility
3. **Environment Variables**: Verify all required environment variables are set

## Local Testing

To test the Cloudflare build locally:

```bash
# Build for Cloudflare
pnpm build:cloudflare

# Install wrangler CLI (if not already installed)
pnpm add -g wrangler

# Preview the build locally
wrangler pages dev dist

# Or use Nitro's built-in preview
npx wrangler pages dev dist
```

## Monitoring

### GitHub Actions
- Monitor deployment status in the **Actions** tab
- Check workflow run logs for detailed information
- Review pull request status checks

### Cloudflare Pages
- Monitor deployments in Cloudflare Pages dashboard
- Check Functions logs for runtime issues
- Review analytics and performance metrics
