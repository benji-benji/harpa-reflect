import PhoneFrame from './PhoneFrame';
import AccountHome from './AccountHome';
import MidRecording from './MidRecording';
import ResponseWithCitations from './ResponseWithCitations';

export default function MockupsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        margin: '-16px 0 -16px calc(-50vw + 50%)',
        padding: '40px 24px 80px',
        background: 'linear-gradient(180deg, #ecebe4 0%, #dcdcd2 100%)',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>HarPA Reflect — Slide 1 Mockups</div>
          <div style={{ fontSize: 14, color: '#555', marginTop: 6 }}>
            Three screens for user-research deck · screenshot individually or together
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <PhoneFrame label="1 · Account home">
            <AccountHome />
          </PhoneFrame>
          <PhoneFrame label="2 · Mid-recording">
            <MidRecording />
          </PhoneFrame>
          <PhoneFrame label="3 · AI response with citations">
            <ResponseWithCitations />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
