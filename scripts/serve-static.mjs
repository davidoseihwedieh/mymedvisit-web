import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] ?? 'out')
const port = Number(process.env.PORT ?? 4180)

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'],
])

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  const decodedPath = decodeURIComponent(url.pathname)
  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.slice(1)
  const candidates = [
    resolve(root, relativePath),
    resolve(root, `${relativePath}.html`),
    resolve(root, relativePath, 'index.html'),
  ]
  const file = candidates.find(
    (candidate) =>
      candidate.startsWith(`${root}${sep}`) &&
      existsSync(candidate) &&
      statSync(candidate).isFile(),
  )

  if (!file) {
    response.writeHead(404, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    })
    response.end('Not found')
    return
  }

  const headers = {
    'Cache-Control':
      decodedPath === '/sms-opt-in' ? 'no-store' : 'public, max-age=60',
    'Content-Type':
      contentTypes.get(extname(file)) ?? 'application/octet-stream',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  }
  response.writeHead(200, headers)
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(
    `Static test server listening on http://127.0.0.1:${port}\n`,
  )
})
