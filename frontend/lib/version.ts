/**
 * Build/version marker. On Vercel, NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA is injected
 * automatically at build time, so the deployed site reports the exact commit it
 * was built from — letting us confirm production matches the latest Git commit.
 * Falls back to a manual version, then "local" for dev builds.
 */
export const APP_BUILD_VERSION =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  process.env.NEXT_PUBLIC_APP_VERSION ||
  "local";
