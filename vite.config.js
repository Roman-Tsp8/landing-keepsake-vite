import { defineConfig } from 'vite';
import vituum from 'vituum';
import pug from '@vituum/vite-plugin-pug';

// base потрібен для збірки під GitHub Pages (https://<user>.github.io/landing-keepsake-vite/).
// У `vite preview` command дорівнює 'serve', тому preview визначаємо окремо (isPreview):
// він віддає dist, зібраний із base, і має слухати той самий base. Лише dev-сервер працює на "/".
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/landing-keepsake-vite/' : '/',
  plugins: [vituum(), pug({ root: './src' })],
  build: {
    // Без base64-вбудовування: маленькі зображення з srcset мають лишатися окремими файлами,
    // інакше браузер не зможе обрати потрібну ширину.
    assetsInlineLimit: 0,
  },
}));
