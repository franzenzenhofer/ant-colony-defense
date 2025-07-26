/**
 * Cloudflare Worker for Ant Colony Defense
 * Serves the static SPA from the dist directory
 */

export default {
  async fetch(request, env, ctx) {
    // Handle all requests by serving static assets
    return env.ASSETS.fetch(request);
  },
};