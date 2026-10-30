import { mockPalette as c } from './PhoneFrame';

export default function AccountHome() {
  return (
    <div style={{ padding: '12px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: c.green,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          SE
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Sereena</div>
          <div style={{ fontSize: 11, color: c.sub }}>Somerford Grove · Playworker</div>
        </div>
      </div>

      {/* Primary CTA */}
      <button
        style={{
          background: c.green,
          color: 'white',
          border: 'none',
          borderRadius: 14,
          padding: '18px 20px',
          fontSize: 16,
          fontWeight: 600,
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <span>
          <div>Start a reflection</div>
          <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.85, marginTop: 2 }}>
            After-session journaling · voice or text
          </div>
        </span>
        <span style={{ fontSize: 22 }}>→</span>
      </button>

      {/* Engagement card */}
      <div
        style={{
          background: c.card,
          borderRadius: 14,
          padding: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>This week</div>
          <div style={{ fontSize: 11, color: c.sub }}>shared with Kerri ✓</div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          <Stat n="3" label="entries" />
          <Stat n="28m" label="reflecting" />
          <Stat n="2" label="moments" />
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
          {[1, 1, 0, 1, 0, 0, 0].map((on, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: on ? c.green : c.line,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 10, color: c.sub, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
      </div>

      {/* Supervisor banner */}
      <div
        style={{
          background: c.amberSoft,
          borderRadius: 12,
          padding: '12px 14px',
          fontSize: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 16 }}>⚑</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: c.amber, marginBottom: 2 }}>
            1 item flagged for supervision
          </div>
          <div style={{ color: '#5b3a05', lineHeight: 1.4 }}>
            Safeguarding note from Tuesday's session — shared with Kerri.
          </div>
        </div>
        <span style={{ fontSize: 18, color: c.amber }}>→</span>
      </div>

      {/* Recent entries */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Recent reflections</div>
          <div style={{ fontSize: 12, color: c.green }}>See all</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <EntryRow
            date="Tue · 21 Apr"
            title="Water-play session, 12 children"
            share="shared"
            mood="😊"
            flag
          />
          <EntryRow date="Mon · 20 Apr" title="Quiet afternoon, den-building" share="private" mood="🙂" />
          <EntryRow date="Fri · 17 Apr" title="After-school, large group" share="shared" mood="😐" />
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{n}</div>
      <div style={{ fontSize: 11, color: c.sub }}>{label}</div>
    </div>
  );
}

function EntryRow({
  date,
  title,
  share,
  mood,
  flag,
}: {
  date: string;
  title: string;
  share: 'shared' | 'private';
  mood: string;
  flag?: boolean;
}) {
  return (
    <div
      style={{
        background: c.card,
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ fontSize: 22 }}>{mood}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: c.sub }}>{date}</div>
        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{title}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <Pill
            bg={share === 'shared' ? c.greenSoft : '#f1f1ee'}
            fg={share === 'shared' ? c.green : c.sub}
            text={share === 'shared' ? '🔓 Shared' : '🔒 Private'}
          />
          {flag && <Pill bg={c.amberSoft} fg={c.amber} text="⚑ Flagged" />}
        </div>
      </div>
      <span style={{ color: c.sub }}>›</span>
    </div>
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
