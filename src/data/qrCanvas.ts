import qrcode from 'qrcode-generator'
import type { Language } from '../types'
import { graphicFonts, paintText, paintWordmark } from './canvasGraphics'

export async function drawQrCard(ctx: CanvasRenderingContext2D, url: string, title: string, callToAction: string, language: Language) {
  const code = qrcode(0, 'M')
  code.addData(url, 'Byte')
  code.make()
  await graphicFonts(language, title + ' ' + callToAction)
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  ctx.fillStyle = '#f3ecdc'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = '#ac9460'
  ctx.lineWidth = 2
  ctx.strokeRect(25, 25, width - 50, height - 50)
  ctx.fillStyle = '#21372b'
  ctx.fillRect(26, 26, width - 52, 122)
  paintWordmark(ctx, 66, 86, width - 132, '#fdf6e8', language === 'ar')
  paintText(ctx, title, language, 62, 213, width - 124, 59, '#21372b', 'display', 2)
  const modules = code.getModuleCount()
  const unit = Math.floor(628 / (modules + 8))
  const size = (modules + 8) * unit
  const x = Math.floor((width - size) / 2)
  const y = 329 + Math.floor((628 - size) / 2)
  ctx.fillStyle = '#fff'
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = '#09140d'
  for (let row = 0; row < modules; row++) {
    for (let column = 0; column < modules; column++) {
      if (code.isDark(row, column)) ctx.fillRect(x + (column + 4) * unit, y + (row + 4) * unit, unit, unit)
    }
  }
  paintText(ctx, callToAction, language, 62, height - 78, width - 124, 34, '#21372b', 'strong')
}
