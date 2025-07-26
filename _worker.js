export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Force cache bust for old assets
    if (url.pathname.includes('/assets/') && url.pathname.includes('1.12.1')) {
      // Redirect old assets to new version
      const newPath = url.pathname.replace('1.12.1', '1.12.2');
      return Response.redirect(url.origin + newPath, 301);
    }
    
    // Fetch the static asset
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    
    // Set aggressive cache headers to force refresh
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};