import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Austin W. Duncan — Pastor, Teacher, Theologian'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#141210',
        }}
      >
        {/* Amber top bar */}
        <div style={{ width: '100%', height: 8, backgroundColor: '#CDB079', flexShrink: 0 }} />

        {/* Center content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 80px',
          }}
        >
          <div
            style={{
              color: '#F9F6F0',
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: '-2px',
              lineHeight: 1.05,
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Austin W. Duncan
          </div>

          <div style={{ width: 72, height: 2, backgroundColor: '#CDB079', marginBottom: 32 }} />

          <div
            style={{
              color: 'rgba(205,176,121,0.85)',
              fontSize: 22,
              letterSpacing: '7px',
              textTransform: 'uppercase',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Pastor · Teacher · Theologian
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '22px 60px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 17, letterSpacing: '3px' }}>
            austinwduncan.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
