import { defineConfig } from 'astro/config';
import staticAdapter from '@astrojs/adapter-static';

export default defineConfig({
  adapter: staticAdapter(),
  output: 'static',
  trailingSlash: 'always',
});
