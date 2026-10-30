import type { ReactNode } from 'react';

const palette = {
  bg: '#f5f5f0',
  ink: '#1a1a1a',
  sub: '#666',
  green: '#2d6a4f',
  greenDark: '#1b4332',
  greenSoft: '#e8f5e9',
  amber: '#b45309',
  amberSoft: '#fef3c7',
  red: '#b91c1c',
  redSoft: '#fee2e2',
  line: '#e0e0e0',
  card: '#ffffff',
};

export const mockPalette = palette;

type PhoneFrameProps = {
  label: string;
  children: ReactNode;
  time?: string;
};

export default function PhoneFrame({ label, children, time = '09:41' }: PhoneFrameProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 375,
          height: 812,
          background: palette.bg,
          borderRadius: 44,
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 0 0 10px #111, 0 0 0 11px #333',
          overflow: 'hidden',
          position: 'relative',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: palette.ink,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            padding: '0 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>{time}</span>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11 }}>••••</span>
            <span style={{ fontSize: 11 }}>Wi-Fi</span>
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 11,
                border: '1px solid #111',
                borderRadius: 3,
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 1,
                  left: 1,
                  bottom: 1,
                  width: 16,
                  background: '#111',
                  borderRadius: 1,
                }}
              />
            </span>
          </span>
        </div>
        <div style={{ height: 'calc(812px - 44px)', overflow: 'auto' }}>{children}</div>
      </div>
      <div style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
