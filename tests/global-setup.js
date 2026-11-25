import { once } from 'node:events'
import { createServer, preview } from 'vite'

export default async function startTestServer(config) {
  const url = new URL(config.projects[0].use.baseURL)
  if (process.env.PLAYWRIGHT_PREVIEW === '1') {
    const server = await preview({
      preview: { host: url.hostname, port: Number(url.port), strictPort: true },
    })
    return async () => {
      const closed = once(server.httpServer, 'close')
      server.httpServer.close()
      await closed
    }
  }
  const server = await createServer({
    server: { host: url.hostname, port: Number(url.port), strictPort: true, watch: null },
  })

  try {
    await server.listen()
  } catch (error) {
    await server.close()
    throw error
  }

  return () => server.close()
}
