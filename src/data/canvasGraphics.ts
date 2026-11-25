import type { Language } from '../types'

const images = new Map<string, Promise<HTMLImageElement>>()

export function graphicImage(src: string) {
  const existing = images.get(src)
  if (existing) return existing
  const image = new Image()
  image.src = src
  const request = image.decode().then(() => image, (error) => {
    images.delete(src)
    throw error
  })
  images.set(src, request)
  return request
}

export function graphicFonts(language: Language, content: string) {
  return Promise.all([
    document.fonts.load('600 40px "DM Sans"', 'MARAMIA UAE ' + content),
    ...(language === 'ar'
      ? [document.fonts.load('700 70px Cairo', content), document.fonts.load('400 40px Cairo', content)]
      : [document.fonts.load('500 70px "Playfair Display"', content), document.fonts.load('400 40px "DM Sans"', content)]),
  ])
}

export function coverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sw = width / scale
  const sh = height / scale
  ctx.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, x, y, width, height)
}

export function textLines(ctx: CanvasRenderingContext2D, value: string, maxWidth: number, maxLines: number) {
  const words = value.trim().split(/\s+/u).filter(Boolean)
  const lines: string[] = []
  let line = ''
  function truncate(text: string) {
    const letters = Array.from(text)
    while (letters.length && ctx.measureText(letters.join('') + '…').width > maxWidth) letters.pop()
    return letters.join('') + '…'
  }
  for (const word of words) {
    const candidate = line ? line + ' ' + word : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate
      continue
    }
    if (!line) {
      line = truncate(word)
      continue
    }
    if (lines.length + 1 >= maxLines) return [...lines, truncate(line + ' ' + word)]
    lines.push(line)
    line = ctx.measureText(word).width <= maxWidth ? word : truncate(word)
  }
  if (line) lines.push(line)
  return lines
}

export function paintText(ctx: CanvasRenderingContext2D, value: string, language: Language, x: number, y: number,
  width: number, size: number, color: string, style: 'display' | 'regular' | 'strong', lines = 1) {
  const family = language === 'ar' ? 'Cairo, sans-serif' : style === 'display' ? '"Playfair Display", Georgia, serif' : '"DM Sans", sans-serif'
  const weight = style === 'strong' ? (language === 'ar' ? 700 : 600) : style === 'display' ? (language === 'ar' ? 700 : 500) : 400
  ctx.font = weight + ' ' + size + 'px ' + family
  ctx.textBaseline = 'middle'
  ctx.direction = language === 'ar' ? 'rtl' : 'ltr'
  ctx.textAlign = language === 'ar' ? 'right' : 'left'
  ctx.fillStyle = color
  const rows = textLines(ctx, value, width, lines)
  rows.forEach((row, index) => ctx.fillText(row, language === 'ar' ? x + width : x, y + index * size * 1.25, width))
  return y + rows.length * size * 1.25
}

export function paintWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string, rtl = false) {
  ctx.font = '600 33px "DM Sans", sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = rtl ? 'right' : 'left'
  ctx.direction = 'ltr'
  ctx.fillStyle = color
  ctx.fillText('MARAMIA  /  UAE', rtl ? x + width : x, y)
}

export function graphicInk(background: string) {
  const rgb = [1, 3, 5].map((index) => Number.parseInt(background.slice(index, index + 2), 16) / 255)
  const linear = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return (linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722) > 0.175 ? '#111914' : '#fffaf0'
}

export async function downloadPng(canvas: HTMLCanvasElement, filename: string) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Canvas export failed')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
