import { handle } from 'hono/vercel';
import { createApp } from '../apps/api/src/app';

const app = createApp();

export default handle(app);
