import { mockPalette as c } from './PhoneFrame';

export default function MidRecording() {
  const bars = [8, 14, 22, 18, 30, 26, 40, 34, 28, 22, 36, 44, 30, 24, 18, 28, 36, 42, 30, 20, 14, 22, 30, 36];

  return (
    <div style={{ padding: '12px 20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: c.green,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ‹ Save draft
        </button>
        <div style={{ fontSize: 12, color: c.sub }}>Step 3 of 8 · Highlights</div>
        <span style={{ width: 60 }} />
      </div>

      {/* Prompt */}
      <div>
        <div style={{ fontSize: 11, color: c.sub, marginBottom: 4, fontWeight: 600, letterSpacing: 0.4 }}>
          PROMPT
        </div>
        <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.35 }}>
          What went well today? What moments stood out?
        </div>
      </div>

      {/* Live recording card */}
      <div
        style={{
          background: c.card,
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: `1px solid ${c.line}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: c.red,
                boxShadow: `0 0 0 4px ${c.redSoft}`,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: c.red }}>Recording</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            01:42
          </div>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 56, marginTop: 14 }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: h,
                background: i < 16 ? c.green : '#b7d5c4',
                borderRadius: 2,
              }}
            />
          ))}
        </div>

        {/* Transport */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 16 }}>
          <CircleBtn label="⏸" sub="Pause" />
          <CircleBtn label="⏹" sub="Stop" primary />
          <CircleBtn label="⟲" sub="Redo" />
        </div>
      </div>

      {/* Live transcript */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600 }}>Live transcript</div>
          <div style={{ fontSize: 11, color: c.sub }}>Whisper · on-server</div>
        </div>
        <div
          style={{
            background: c.card,
            borderRadius: 12,
            padding: 14,
            fontSize: 13,
            lineHeight: 1.55,
            border: `1px solid ${c.line}`,
          }}
        >
          <p style={{ margin: 0 }}>
            Busy afternoon, about fifteen kids on site. The den-building in the back corner went really well —{' '}
            <mark
              style={{
                background: c.greenSoft,
                color: c.greenDark,
                padding: '1px 4px',
                borderRadius: 4,
              }}
            >
              two of the younger ones who usually stay on the edges actually led the build
            </mark>
            , which felt like a moment worth holding on to.
          </p>
          <p style={{ margin: '10px 0 0' }}>
            Later on{' '}
            <mark
              style={{
                background: c.amberSoft,
                color: '#5b3a05',
                padding: '1px 4px',
                borderRadius: 4,
                borderBottom: `2px solid ${c.amber}`,
              }}
            >
              J mentioned something about home that I think Kerri should know about
            </mark>
            {' '}— I'll park it here rather than go into detail now.
          </p>
          <p style={{ margin: '10px 0 0' }}>
            <mark
              style={{
                background: '#f1f1ee',
                color: c.sub,
                padding: '1px 4px',
                borderRadius: 4,
                textDecoration: 'line-through solid rgba(0,0,0,0.25)',
              }}
            >
              Personal note — stressful morning before getting in
            </mark>{' '}
            <span style={{ fontSize: 11, color: c.sub, fontWeight: 600 }}>· private</span>
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 8,
              color: c.sub,
              fontSize: 12,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: 14,
                background: c.sub,
                animation: 'none',
              }}
            />
            <span>transcribing…</span>
          </div>
        </div>

        {/* Selection action bar */}
        <div
          style={{
            marginTop: 10,
            background: '#1a1a1a',
            color: 'white',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            fontSize: 12,
          }}
        >
          <span style={{ opacity: 0.7 }}>Selection:</span>
          <SelectionAction text="Mark private" icon="🔒" />
        </div>
      </div>

      {/* Bottom share toggle */}
      <div
        style={{
          background: c.card,
          borderRadius: 14,
          padding: 14,
          border: `1px solid ${c.line}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Share this entry with Kerri</div>
          <div style={{ fontSize: 11, color: c.sub, marginTop: 2 }}>
            Private sections stay hidden. Flagged items always shared.
          </div>
        </div>
        <Toggle on />
      </div>

      {/* Primary action */}
      <button
        style={{
          background: c.green,
          color: 'white',
          border: 'none',
          borderRadius: 12,
          padding: '14px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Next prompt →
      </button>
    </div>
  );
}

function CircleBtn({ label, sub, primary }: { label: string; sub: string; primary?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: primary ? 56 : 48,
          height: primary ? 56 : 48,
          borderRadius: '50%',
          background: primary ? c.red : '#f1f1ee',
          color: primary ? 'white' : '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: primary ? 20 : 18,
          boxShadow: primary ? '0 4px 12px rgba(185,28,28,0.35)' : 'none',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 10, color: c.sub }}>{sub}</div>
    </div>
  );
}

function SelectionAction({ text, icon }: { text: string; icon: string }) {
  return (
    <span
      style={{
        background: 'rgba(255,255,255,0.12)',
        padding: '4px 8px',
        borderRadius: 8,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 600,
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      style={{
        width: 44,
        height: 26,
        background: on ? c.green : '#ccc',
        borderRadius: 13,
        position: 'relative',
        transition: 'background 0.15s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 20 : 2,
          width: 22,
          height: 22,
          background: 'white',
          borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
}
