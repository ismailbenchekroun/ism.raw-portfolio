/**
 * ism.raw — GitHub OAuth Worker for Decap CMS
 * Deploy this to Cloudflare Workers (free tier)
 *
 * Required environment secrets (set in Cloudflare dashboard):
 *   GITHUB_CLIENT_ID     — your OAuth App client ID
 *   GITHUB_CLIENT_SECRET — your OAuth App client secret
 *   SITE_URL             — https://ism-raw-portfolio.pages.dev
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const SITE = env.SITE_URL || 'https://ism-raw-portfolio.pages.dev';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': SITE,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Step 1 — redirect to GitHub login
    if (url.pathname === '/auth') {
      const callback = `${url.origin}/callback`;
      const githubUrl = new URL('https://github.com/login/oauth/authorize');
      githubUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      githubUrl.searchParams.set('redirect_uri', callback);
      githubUrl.searchParams.set('scope', 'repo,user');
      return Response.redirect(githubUrl.toString(), 302);
    }

    // Step 2 — GitHub calls back here with ?code=xxx
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      // Exchange code for token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const { access_token, error } = await tokenRes.json();
      if (error || !access_token) {
        return new Response(`GitHub OAuth error: ${error}`, { status: 400 });
      }

      // Return HTML that posts the token back to the Decap CMS window
      const html = `<!DOCTYPE html><html><body><script>
        (function() {
          function receive(e) {
            window.opener.postMessage(
              'authorization:github:success:{"token":"${access_token}","provider":"github"}',
              e.origin
            );
          }
          window.addEventListener("message", receive, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script></body></html>`;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': SITE,
        },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
