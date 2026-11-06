import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { moCsdl } from './db';
import { taoApp } from './app';

const app = taoApp(moCsdl());
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', serveStatic({ path: './dist/index.html' }));
}
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, () => console.log(`API chạy ở http://localhost:${port}`));
