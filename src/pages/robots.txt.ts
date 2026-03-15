export function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://drama-birth-quest3.pages.dev/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
