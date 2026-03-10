/* eslint-disable no-undef */
// ✅ 已为 EdgeOne Pages 部署优化：代码分包、Brotli/Gzip 双压缩、资源哈希命名
import { defineConfig, loadEnv } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /(.*?)\.(js|css|woff2|woff|ttf)/,
              handler: "CacheFirst",
              options: {
                cacheName: "js-css-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|webp)/,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
              },
            },
            {
              urlPattern:
                /^https:\/\/(v1\.hitokoto\.cn|restapi\.amap\.com|api\.oioweb\.cn|api-meting\.imsyy\.top)/,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 5,
                },
              },
            },
          ],
        },
        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
          icons: [
            { src: "/images/icon/48.png", sizes: "48x48", type: "image/png" },
            { src: "/images/icon/72.png", sizes: "72x72", type: "image/png" },
            { src: "/images/icon/96.png", sizes: "96x96", type: "image/png" },
            { src: "/images/icon/128.png", sizes: "128x128", type: "image/png" },
            { src: "/images/icon/144.png", sizes: "144x144", type: "image/png" },
            { src: "/images/icon/192.png", sizes: "192x192", type: "image/png" },
            { src: "/images/icon/512.png", sizes: "512x512", type: "image/png" },
          ],
        },
      }),
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 10240,
      }),
      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 10240,
      }),
    ],
    server: {
      port: "3000",
      open: true,
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: `@use "./src/style/global.scss" as *;`,
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    build: {
      target: "es2015",
      minify: "terser",
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "vue-core": ["vue", "pinia", "pinia-plugin-persistedstate"],
            "element-plus": ["element-plus"],
            swiper: ["swiper"],
            aplayer: ["aplayer", "@worstone/vue-aplayer"],
            utils: ["axios", "dayjs", "lodash-es", "fetch-jsonp"],
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            if (/\.(css)$/.test(assetInfo.name)) {
              return "assets/css/[name]-[hash][extname]";
            }
            if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
              return "assets/fonts/[name]-[hash][extname]";
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return "assets/img/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },
  });
