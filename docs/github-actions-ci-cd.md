# GitHub Actions CI/CD Pipeline

This document describes the GitHub Actions workflows used for continuous integration and deployment of the 10xCards application.

## Overview

The project uses two main GitHub Actions workflows:

1. **Pull Request Workflow** (`.github/workflows/pull-request.yml`) - Quality assurance for PRs
2. **Master Deployment Workflow** (`.github/workflows/master.yml`) - Production deployment

## Workflow Architecture

### Composite Actions

**`.github/actions/setup-node-pnpm/action.yml`**
- Reusable action for Node.js and pnpm setup
- Handles Node.js 22 installation with caching
- Installs pnpm v9 and project dependencies
- Used across all workflows for consistency

## Pull Request Workflow

**Trigger**: Pull requests to `master` branch

**Jobs**:
1. **Lint** - ESLint code quality checks
2. **Unit Test** - Vitest unit tests with coverage
3. **E2E Test** - Playwright end-to-end tests
4. **Status Comment** - Automated PR status updates

**Features**:
- ✅ Parallel execution of lint and test jobs
- ✅ Coverage reporting and artifact upload
- ✅ E2E testing with Supabase integration
- ✅ Automated PR status comments
- ✅ Environment-specific configuration

### Environment Variables (E2E Tests)
```env
NUXT_PUBLIC_SUPABASE_URL=${{ secrets.NUXT_PUBLIC_SUPABASE_URL }}
NUXT_PUBLIC_SUPABASE_KEY=${{ secrets.NUXT_PUBLIC_SUPABASE_KEY }}
OPENROUTER_API_KEY=${{ secrets.OPENROUTER_API_KEY }}
E2E_USERNAME_ID=${{ secrets.E2E_USERNAME_ID || 'test-user-id' }}
E2E_USERNAME=${{ secrets.E2E_USERNAME || 'test@example.com' }}
E2E_PASSWORD=${{ secrets.E2E_PASSWORD || 'password123' }}
BASE_URL=${{ secrets.BASE_URL || 'http://localhost:3000' }}
```

## Master Deployment Workflow

**Trigger**: 
- Push to `master` branch (disabled by default)
- Manual workflow dispatch

**Jobs**:
1. **Lint** - Code quality verification
2. **Unit Test** - Test suite execution with coverage
3. **Build** - Cloudflare-optimized build
4. **Deploy** - Automated Cloudflare Pages deployment
5. **Status Notification** - Deployment status reporting

**Features**:
- ✅ Sequential job execution with dependencies
- ✅ Artifact management (build outputs, coverage reports)
- ✅ Production environment configuration
- ✅ Cloudflare Pages integration via Wrangler
- ✅ Deployment status notifications

### Build Configuration
```yaml
Build Command: pnpm build:cloudflare
Output Directory: dist/
Node.js Version: 22
Package Manager: pnpm v9
Cloudflare Preset: cloudflare-pages
```

### Environment Variables (Production)
```env
NUXT_PUBLIC_SUPABASE_URL=${{ secrets.NUXT_PUBLIC_SUPABASE_URL }}
NUXT_PUBLIC_SUPABASE_KEY=${{ secrets.NUXT_PUBLIC_SUPABASE_KEY }}
OPENROUTER_API_KEY=${{ secrets.OPENROUTER_API_KEY }}
CLOUDFLARE_API_TOKEN=${{ secrets.CLOUDFLARE_API_TOKEN }}
CLOUDFLARE_ACCOUNT_ID=${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
CLOUDFLARE_PROJECT_NAME=${{ secrets.CLOUDFLARE_PROJECT_NAME }}
```

## Action Versions

All workflows use the latest major versions of GitHub Actions:

- `actions/checkout@v5`
- `actions/setup-node@v6`
- `pnpm/action-setup@v4`
- `actions/upload-artifact@v4`
- `actions/download-artifact@v4`
- `cloudflare/wrangler-action@v3`

## Best Practices Implemented

### Performance Optimizations
- ✅ Node.js dependency caching via `cache: 'pnpm'`
- ✅ Frozen lockfile installation (`--frozen-lockfile`)
- ✅ Composite actions for code reuse
- ✅ Parallel job execution where possible

### Security
- ✅ Environment-specific secret management
- ✅ Production environment protection
- ✅ Minimal required permissions
- ✅ Secret masking in logs

### Reliability
- ✅ Explicit dependency management
- ✅ Artifact retention policies
- ✅ Error handling and status reporting
- ✅ Consistent environment setup

## Monitoring and Debugging

### GitHub Actions Dashboard
- Monitor workflow runs in the **Actions** tab
- Review detailed logs for each job step
- Check artifact uploads and downloads
- Monitor workflow performance metrics

### Common Issues and Solutions

**1. pnpm Not Found**
- Ensure composite action runs pnpm setup before Node.js setup
- Verify pnpm version compatibility

**2. Build Artifacts Missing**
- Check artifact upload/download paths
- Verify build output directory (`dist/` not `.output/public`)

**3. Cloudflare Deployment Failures**
- Validate API token permissions
- Check project name and account ID
- Verify Wrangler command syntax

**4. E2E Test Failures**
- Check Supabase connection and credentials
- Verify test environment setup
- Review Playwright browser installation

## Maintenance

### Regular Updates
- Monitor for new action versions monthly
- Update Node.js version in `.nvmrc` as needed
- Review and update pnpm version quarterly
- Audit secret rotation annually

### Performance Monitoring
- Track workflow execution times
- Monitor artifact sizes and retention
- Review cache hit rates
- Analyze failure patterns

## Future Enhancements

### Planned Improvements
- [ ] Matrix builds for multiple Node.js versions
- [ ] Deployment previews for pull requests
- [ ] Advanced caching strategies
- [ ] Integration with external monitoring tools
- [ ] Automated dependency updates

### Scalability Considerations
- Workflow concurrency limits
- Artifact storage optimization
- Secret management at scale
- Multi-environment deployment strategies
