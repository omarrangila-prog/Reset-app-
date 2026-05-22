export async function GET() {
  const baseUrl = 'https://reset-recovery-helper.vercel.app';

  const pages = [
    { url: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '1.0' },
    { url: '/dashboard', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: '0.9' },
    { url: '/coach', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8' },
    { url: '/tasks', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.7' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
