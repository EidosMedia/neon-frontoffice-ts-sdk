export class NeonConnection {
  REVALIDATE_TIMEOUT = 3600;

  async getSiteViewByURL(url: string) {
    return await fetch(
      `${process.env.BASE_NEON_FE_URL}/api/site-view?url=${url}`,
      {
        headers: {
          'x-neon-backend-access-key': '',
        },
      }
    );
  }

  async getSitesList() {
    const req = await fetch(`${process.env.BASE_NEON_FE_URL}/api/sites/live`);
    const sites = await req.json();
    return sites;
  }
}
