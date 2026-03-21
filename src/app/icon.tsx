import { ImageResponse } from 'next/og'
import { getGlobalSettings } from '@/app/actions/settings'

// Image metadata
export const size = {
  width: 120,
  height: 120,
}
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

export default async function Icon() {
  const settings = await getGlobalSettings()

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: settings.accentColor,
          borderRadius: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 64,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            fontStyle: 'italic',
            transform: 'translateX(4px)',
          }}
        >
          DV
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
