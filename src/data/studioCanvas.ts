import type { Language } from '../types'
import { coverImage, graphicFonts, graphicImage, graphicInk, paintText, paintWordmark } from './canvasGraphics'
import { graphicImages, type Template } from './graphicTemplates'

export type StudioCopy = { headline: string; text: string; action: string }

export async function drawStudioGraphic(ctx: CanvasRenderingContext2D, template: Template, imageId: keyof typeof graphicImages,
  background: string, code: string, copy: StudioCopy, language: Language) {
  const { width, height } = ctx.canvas
  const [photo] = await Promise.all([graphicImage(graphicImages[imageId].src), graphicFonts(language, Object.values(copy).join(' '))])
  const rtl = language === 'ar'
  const wide = width > height
  const story = height > width
  const split = wide || (template.layout === 'split' && !story)
  const margin = 62
  const accent = graphicInk(background) === '#111914' ? '#694a25' : '#e8c489'
  const ink = graphicInk(background)
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  let textX = margin
  let textWidth = width - margin * 2
  let textY = height * 0.61
  if (split) {
    const panelWidth = wide ? width * 0.53 : width * 0.52
    const imageX = rtl ? 0 : panelWidth
    const textPanelX = rtl ? width - panelWidth : 0
    const photoWidth = width - panelWidth
    const inset = template.layout === 'arch' ? 26 : 0
    const imageSide = photoWidth - inset * 2
    if (inset > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(imageX + inset, inset, imageSide, height - inset * 2, [140, 140, 0, 0])
      ctx.clip()
    }
    coverImage(ctx, photo, imageX + inset, inset, imageSide, height - inset * 2)
    if (inset > 0) ctx.restore()
    textX = textPanelX + margin
    textWidth = panelWidth - margin * 2
    textY = height * (wide ? 0.36 : 0.31)
  } else if (template.layout === 'overlay') {
    coverImage(ctx, photo, 0, 0, width, story ? height * 0.57 : height * 0.52)
    textY = height * 0.66
  } else {
    const frameY = story ? height * 0.095 : 114
    const frameH = height * (story ? 0.43 : 0.41)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(margin, frameY, width - margin * 2, frameH, template.layout === 'arch' ? [165, 165, 0, 0] : 0)
    ctx.clip()
    coverImage(ctx, photo, margin, frameY, width - margin * 2, frameH)
    ctx.restore()
  }

  const brandY = !split && template.layout === 'overlay' ? height * (story ? 0.605 : 0.56) : (story ? 102 : 68)
  paintWordmark(ctx, textX, brandY, textWidth, ink, rtl)
  ctx.fillStyle = accent
  ctx.fillRect(rtl ? textX + textWidth - 90 : textX, textY - 56, 90, 4)

  const titleSize = !wide && split ? 51 : story ? 80 : 69
  const bodySize = !wide && split ? 29 : story ? 42 : 33
  let line = paintText(ctx, copy.headline, language, textX, textY, textWidth, titleSize, ink, 'display', split ? 3 : 2) + 11
  line = paintText(ctx, copy.text, language, textX, line, textWidth, bodySize, ink, 'regular', split ? 4 : 2) + 14
  if (code.trim()) {
    ctx.font = '600 30px "DM Sans", sans-serif'
    ctx.textAlign = rtl ? 'right' : 'left'
    ctx.direction = 'ltr'
    ctx.fillStyle = ink
    ctx.fillText(code.trim(), rtl ? textX + textWidth : textX, line, textWidth)
    line += 48
  }
  paintText(ctx, copy.action, language, textX, line, textWidth, 35, ink, 'strong', split ? 2 : 1)
}
