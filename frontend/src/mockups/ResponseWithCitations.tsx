import { mockPalette as c } from './PhoneFrame';

export default function ResponseWithCitations() {
  return (
    <div style={{ padding: '12px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          ‹ Entries
        </button>
        <div style={{ fontSize: 12, color: c.sub }}>Tue · 21 Apr</div>
        <span style={{ fontSize: 18 }}>⋯</span>
      </div>

      {/* Title */}
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}>
          Water-play session, 12 children
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <Pill bg={c.greenSoft} fg={c.green} text="🔓 Shared with Kerri" />
          <Pill bg={c.amberSoft} fg={c.amber} text="⚑ Flagged" />
        </div>
      </div>

      {/* Your reflection (collapsed) */}
      <div
        style={{
          background: c.card,
          borderRadius: 12,
          padding: 14,
          border: `1px solid ${c.line}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, color: c.sub }}>YOUR REFLECTION</div>
          <div style={{ fontSize: 11, color: c.green, fontWeight: 600 }}>Expand ▾</div>
        </div>
        <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5, color: '#333' }}>
          Busy afternoon, about fifteen kids on site. The den-building went really well — two
          younger children who usually stay on the edges actually led the build…
        </p>
      </div>

      {/* AI coaching response */}
      <div
        style={{
          background: c.greenSoft,
          borderRadius: 16,
          padding: 16,
          borderLeft: `4px solid ${c.green}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: c.green,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ✶
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.greenDark }}>
                Coaching reflection
              </div>
              <div style={{ fontSize: 10, color: c.sub }}>Grounded in playwork theory</div>
            </div>
          </div>
          <Pill bg="white" fg={c.green} text="🔓 Shared" />
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: '#1a2e26' }}>
          Two younger children leading the den-build looks like{' '}
          <b style={{ fontWeight: 600 }}>socio-dramatic play</b> taking root{' '}
          <Citation n={1} />. Holding back rather than directing let that emerge —
          close to the <b style={{ fontWeight: 600 }}>compound flexibility</b> Brown
          describes <Citation n={2} />.
        </p>

        {/* Next-session suggestion */}
        <div
          style={{
            marginTop: 12,
            background: 'white',
            borderRadius: 10,
            padding: '10px 12px',
            border: `1px dashed ${c.green}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: c.green,
              marginBottom: 4,
            }}
          >
            NEXT SESSION · TRY THIS
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.45, color: '#1a2e26' }}>
            Try waiting until you're approached before initiating play.
          </div>
        </div>
      </div>

      {/* Citations list */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, color: c.sub, marginBottom: 8 }}>
          CITATIONS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CitationRow
            n={1}
            title="Socio-dramatic play · 16 play types"
            source="Hughes, B. — Evolutionary Playwork (2012)"
          />
          <CitationRow
            n={2}
            title="Compound flexibility"
            source="Brown, F. — Playwork: Theory and Practice (2003)"
          />
        </div>
      </div>

      {/* Safeguarding strip */}
      <div
        style={{
          background: c.amberSoft,
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 16 }}>⚑</span>
        <div style={{ flex: 1, fontSize: 12, lineHeight: 1.45 }}>
          <div style={{ fontWeight: 700, color: c.amber, marginBottom: 2 }}>
            Flagged for supervision with Kerri
          </div>
          <div style={{ color: '#5b3a05' }}>
            Content not shown in AI response. Discuss in Thursday's 1:1.
          </div>
        </div>
        <button
          style={{
            background: c.amber,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Open
        </button>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        <BottomAction icon="✨" label="Mark moment" />
        <BottomAction icon="🔒" label="Privacy" />
      </div>
    </div>
  );
}

const citationBlue = '#2563eb';

function Citation({ n }: { n: number }) {
  return (
    <sup
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 16,
        height: 16,
        padding: '0 4px',
        background: citationBlue,
        color: 'white',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 700,
        marginLeft: 2,
        verticalAlign: 'super',
        lineHeight: 1,
      }}
    >
      {n}
    </sup>
  );
}

function CitationRow({ n, title, source }: { n: number; title: string; source: string }) {
  return (
    <div
      style={{
        background: c.card,
        borderRadius: 10,
        padding: 10,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        border: `1px solid ${c.line}`,
      }}
    >
      <div
        style={{
          minWidth: 22,
          height: 22,
          background: citationBlue,
          color: 'white',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, color: c.sub, marginTop: 2 }}>{source}</div>
      </div>
      <span style={{ color: c.sub }}>›</span>
    </div>
  );
}

function BottomAction({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button
      style={{
        flex: 1,
        background: active ? c.green : c.card,
        color: active ? 'white' : '#333',
        border: `1px solid ${active ? c.green : c.line}`,
        borderRadius: 12,
        padding: '10px 8px',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}

function Pill({ bg, fg, text }: { bg: string; fg: string; text: string }) {
  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontSize: 10,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
      }}
    >
      {text}
    </span>
  );
}
