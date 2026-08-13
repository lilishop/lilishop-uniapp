import { nextTick } from 'vue'
import DrawPoster from '@/js_sdk/u-draw-poster'

export const POSTER_WIDTH = 630
export const POSTER_HEIGHT = 1000

const QR_SIZE = 180
const AVATAR_SIZE = 86
const PADDING_H = 24
const MEMBER_LEFT = PADDING_H + 16
const BOTTOM_RATIO = 0.06
const MEMBER_ROW_GAP = 12
const NAME_FONT_SIZE = 30
const SLOGAN_FONT_SIZE = 24
const NAME_LINE_HEIGHT = 38
const SLOGAN_LINE_HEIGHT = 32

// #ifdef MP-WEIXIN
const st2 = (size: number) => size * 2
// #endif
// #ifndef MP-WEIXIN
const st2 = (size: number) => size
// #endif

export interface DistributionPosterOptions {
  backgroundImage?: string
  memberAvatar?: string
  memberName?: string
  slogan?: string
  qrImage: string
  textColor?: string
  showMemberInfo?: boolean
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function resolveImagePath(url: string) {
  if (!url) {
    throw new Error('图片地址无效')
  }
  if (
    url.startsWith('data:') ||
    url.startsWith('wxfile://') ||
    url.startsWith('http://tmp/') ||
    url.startsWith('https://tmp/') ||
    url.startsWith('file://')
  ) {
    return url
  }
  const res = await uni.downloadFile({ url })
  if (res.statusCode === 200 && res.tempFilePath) {
    return res.tempFilePath
  }
  throw new Error('图片下载失败，请检查图片域名配置')
}

function getImageInfo(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: (res) => resolve({ width: res.width, height: res.height }),
      fail: reject,
    })
  })
}

function calcCoverBox(imgW: number, imgH: number, boxW: number, boxH: number) {
  const scale = Math.max(boxW / imgW, boxH / imgH)
  const width = imgW * scale
  const height = imgH * scale
  return {
    x: (boxW - width) / 2,
    y: (boxH - height) / 2,
    width,
    height,
  }
}

export function clearDrawPosterCache(selector: string) {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  if (!page) return
  delete page[`#${selector}__dp`]
  delete page[`${selector}__dp`]
}

async function waitCanvasReady() {
  await nextTick()
  await sleep(150)
}

async function drawCircleImage(ctx: any, src: string, x: number, y: number, size: number) {
  const radius = size / 2
  const cx = x + radius
  const cy = y + radius
  ctx.save()
  ctx.beginPath()
  ctx.arc(st2(cx), st2(cy), st2(radius), 0, Math.PI * 2)
  ctx.clip()
  await ctx.drawImage(src, st2(x), st2(y), st2(size), st2(size))
  ctx.restore()
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.lineWidth = st2(2)
  ctx.beginPath()
  ctx.arc(st2(cx), st2(cy), st2(radius - 1), 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export async function composeDistributionPoster(
  selector: string,
  componentThis: any,
  options: DistributionPosterOptions
): Promise<string> {
  const {
    backgroundImage = '',
    memberAvatar = '',
    memberName = '分销员',
    slogan = '',
    qrImage,
    textColor = '#1f2a44',
    showMemberInfo = true,
  } = options

  if (!qrImage) {
    throw new Error('葵花码未生成')
  }

  clearDrawPosterCache(selector)
  await waitCanvasReady()

  const dp = await DrawPoster.build({
    selector,
    componentThis,
    loading: false,
    debugging: false,
  })

  if (!dp?.canvas || !dp?.ctx) {
    throw new Error('画布初始化失败，请重试')
  }

  // #ifdef MP-WEIXIN
  dp.canvas.width = st2(POSTER_WIDTH)
  dp.canvas.height = st2(POSTER_HEIGHT)
  // #endif

  const localQr = await resolveImagePath(qrImage)
  let localBg = ''
  if (backgroundImage) {
    try {
      localBg = await resolveImagePath(backgroundImage)
    } catch (error) {
      console.warn('poster background download failed', error)
    }
  }
  let localAvatar = ''
  if (showMemberInfo && memberAvatar) {
    try {
      localAvatar = await resolveImagePath(memberAvatar)
    } catch (error) {
      console.warn('poster avatar download failed', error)
    }
  }

  const bottomOffset = POSTER_HEIGHT * BOTTOM_RATIO
  const rowBottom = POSTER_HEIGHT - bottomOffset
  const qrX = POSTER_WIDTH - PADDING_H - QR_SIZE
  const qrY = rowBottom - QR_SIZE

  await dp.draw((ctx: any) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(st2(0), st2(0), st2(POSTER_WIDTH), st2(POSTER_HEIGHT))
  })

  if (localBg) {
    await dp.draw(async (ctx: any) => {
      const { width: imgW, height: imgH } = await getImageInfo(localBg)
      const fit = calcCoverBox(imgW, imgH, POSTER_WIDTH, POSTER_HEIGHT)
      await ctx.drawImage(
        localBg,
        st2(fit.x),
        st2(fit.y),
        st2(fit.width),
        st2(fit.height)
      )
    })
  }

  await dp.draw(async (ctx: any) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRoundRect(st2(qrX), st2(qrY), st2(QR_SIZE), st2(QR_SIZE), st2(12))
    await ctx.drawImage(localQr, st2(qrX), st2(qrY), st2(QR_SIZE), st2(QR_SIZE))
  })

  if (showMemberInfo) {
    await dp.draw(async (ctx: any) => {
      const textMaxWidth = qrX - MEMBER_LEFT - 16
      const memberBlockHeight =
        AVATAR_SIZE +
        MEMBER_ROW_GAP +
        NAME_LINE_HEIGHT +
        (slogan ? MEMBER_ROW_GAP + SLOGAN_LINE_HEIGHT : 0)
      const blockHeight = Math.max(memberBlockHeight, QR_SIZE)
      const blockTop = rowBottom - blockHeight

      const avatarX = MEMBER_LEFT
      const avatarY = blockTop
      const nameY = avatarY + AVATAR_SIZE + MEMBER_ROW_GAP
      const sloganY = nameY + NAME_LINE_HEIGHT + MEMBER_ROW_GAP

      if (localAvatar) {
        await drawCircleImage(ctx, localAvatar, avatarX, avatarY, AVATAR_SIZE)
      } else {
        const radius = AVATAR_SIZE / 2
        ctx.save()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.beginPath()
        ctx.arc(st2(avatarX + radius), st2(avatarY + radius), st2(radius), 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = st2(2)
        ctx.stroke()
        ctx.restore()
      }

      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillStyle = textColor
      ctx.font = `bold ${st2(NAME_FONT_SIZE)}px PingFang SC`
      ctx.fillWarpText({
        text: memberName,
        maxWidth: st2(textMaxWidth),
        x: st2(avatarX),
        y: st2(nameY),
        layer: 1,
        lineHeight: st2(NAME_LINE_HEIGHT),
      })

      if (slogan) {
        ctx.font = `${st2(SLOGAN_FONT_SIZE)}px PingFang SC`
        ctx.fillWarpText({
          text: slogan,
          maxWidth: st2(textMaxWidth),
          x: st2(avatarX),
          y: st2(sloganY),
          layer: 1,
          lineHeight: st2(SLOGAN_LINE_HEIGHT),
        })
      }
    })
  }

  const path = await dp.createImagePath()
  if (!path || path === '---stop createImagePath---') {
    throw new Error('海报图片导出失败')
  }
  return path
}

export function savePosterToAlbum(filePath: string) {
  if (!filePath) return
  uni.saveImageToPhotosAlbum({
    filePath,
    success: () => {
      uni.showToast({ title: '已保存到相册', icon: 'none' })
    },
    fail: (err: any) => {
      const errMsg = err?.errMsg || ''
      if (errMsg.includes('auth deny') || errMsg.includes('authorize')) {
        uni.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.openSetting({})
            }
          },
        })
        return
      }
      uni.showToast({ title: '保存失败', icon: 'none' })
    },
  })
}
