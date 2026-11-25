import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { approvedPublicOrigin } from './src/data/publicOrigin'

function presentationHtml(origin: string | undefined): Plugin {
  return {
    name: 'maramia-presentation-html',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        const assets = Object.keys(bundle ?? {})
        const desktop = assets.find((file) => /^assets\/hero-[^-][\w-]*\.webp$/.test(file) && !file.startsWith('assets/hero-mobile-'))
        const mobile = assets.find((file) => file.startsWith('assets/hero-mobile-') && file.endsWith('.webp'))
        const tags = desktop && mobile ? [{
          tag: 'script', injectTo: 'head' as const,
          children: `if(location.pathname==='/'){const link=document.createElement('link');link.rel='preload';link.as='image';link.fetchPriority='high';link.href=matchMedia('(max-width: 600px) and (max-aspect-ratio: 3/4)').matches?${JSON.stringify('/' + mobile)}:${JSON.stringify('/' + desktop)};document.head.append(link)}`,
        }] : []
        return { html: origin ? html.replace('content="/maramia-share.jpg"', `content="${origin}/maramia-share.jpg"`) : html, tags }
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const { VITE_PUBLIC_SITE_URL } = loadEnv(mode, '.', 'VITE_')
  return {
    plugins: [react(), presentationHtml(approvedPublicOrigin(VITE_PUBLIC_SITE_URL))],
    build: {
      rollupOptions: {
        output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] } },
      },
    },
  }
})
