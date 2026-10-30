import { useEffect, useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { JournalEntry } from '../types/api';
import { getEntry } from '../services/api';

const PROMPT_LABELS: Record<string, string> = {
  session_context: 'Session Context',
  highlights: 'Highlights',
  challenges: 'Challenges',
  observations: 'Observations',
  interventions: 'Interventions',
  goal_checkin: 'Goal Check-in',
  mood: 'Mood',
  anything_else: 'Anything Else',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Citation heuristic: a parenthetical that starts with an uppercase letter and
// contains a comma — matches author-style citations like
// "(Sturrock & Else, The Colorado Paper)", "(Russell, 2008)",
// "(Reframing Playwork, p.26)" — without false-positive short-phrase parens.
const CITATION_PATTERN = /\(([A-Z][^()]*?,[^()]*)\)/;

function renderParagraph(
  text: string,
  keyPrefix: string,
  onCitation: (ref: string) => void
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let token = 0;
  const pushKey = () => `${keyPrefix}-${token++}`;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '"' || ch === '“') {
      const closing = ch === '"' ? '"' : '”';
      let end = text.indexOf(closing, i + 1);
      if (end === -1 && closing === '"') end = text.indexOf('"', i + 1);
      if (end === -1) {
        nodes.push(<span key={pushKey()}>{text.slice(i)}</span>);
        break;
      }
      const quote = text.slice(i + 1, end);
      const rest = text.slice(end + 1);
      const m = rest.match(new RegExp('^(\\s*)' + CITATION_PATTERN.source));
      if (m) {
        nodes.push(
          <em key={pushKey()} className="theory-quote">"{quote}"</em>
        );
        if (m[1]) nodes.push(<span key={pushKey()}>{m[1]}</span>);
        const ref = m[2];
        onCitation(ref);
        nodes.push(
          <strong key={pushKey()} className="citation">({ref})</strong>
        );
        i = end + 1 + m[0].length;
      } else {
        nodes.push(
          <em key={pushKey()} className="user-quote">"{quote}"</em>
        );
        i = end + 1;
      }
      continue;
    }

    if (ch === '(') {
      const m = text.slice(i).match(new RegExp('^' + CITATION_PATTERN.source));
      if (m) {
        const ref = m[1];
        onCitation(ref);
        nodes.push(
          <strong key={pushKey()} className="citation">({ref})</strong>
        );
        i += m[0].length;
        continue;
      }
    }

    // plain text run until next relevant delimiter
    let j = i + 1;
    while (j < text.length && text[j] !== '"' && text[j] !== '“' && text[j] !== '(') {
      j++;
    }
    nodes.push(<span key={pushKey()}>{text.slice(i, j)}</span>);
    i = j;
  }

  return nodes;
}

function splitReferencesSection(text: string): { body: string; references: string[] } {
  // Look for "References" header line, case-insensitive, optionally preceded by ##
  const m = text.match(/\n\s*(?:##\s*)?References\s*:?\s*\n/i);
  if (!m || m.index === undefined) return { body: text, references: [] };
  const body = text.slice(0, m.index).trim();
  const refsRaw = text.slice(m.index + m[0].length).trim();
  const references = refsRaw
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
  return { body, references };
}

function renderMarkdownItalics(line: string, keyPrefix: string): ReactNode[] {
  // Render *italic* markdown inline. Minimal — one-pass split.
  const parts = line.split(/(\*[^*]+\*)/g);
  return parts.map((p, idx) => {
    if (/^\*[^*]+\*$/.test(p)) {
      return <em key={`${keyPrefix}-i${idx}`}>{p.slice(1, -1)}</em>;
    }
    return <span key={`${keyPrefix}-s${idx}`}>{p}</span>;
  });
}

function renderAIResponse(responseText: string): {
  paragraphs: ReactNode;
  references: string[];
} {
  const { body, references: explicitRefs } = splitReferencesSection(responseText);
  const inlineRefs: string[] = [];
  const onCitation = (r: string) => {
    if (!inlineRefs.includes(r)) inlineRefs.push(r);
  };

  const paragraphs = body
    .split(/\n{2,}|\r\n\r\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  const source = paragraphs.length > 0 ? paragraphs : [body];

  const rendered = (
    <>
      {source.map((p, i) => (
        <p key={i}>{renderParagraph(p, `p${i}`, onCitation)}</p>
      ))}
    </>
  );

  // Prefer explicit References section if the LLM emitted one; else fall back to in-text
  const references = explicitRefs.length > 0 ? explicitRefs : inlineRefs;
  return { paragraphs: rendered, references };
}

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getEntry(id).then(setEntry).finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) return <div className="entry-detail"><p>Loading...</p></div>;
  if (!entry) return <div className="entry-detail"><p>Entry not found.</p></div>;

  const ai = entry.ai_response
    ? renderAIResponse(entry.ai_response.response_text)
    : null;

  return (
    <div className="entry-detail">
      <Link to="/" className="back-link">Back to entries</Link>
      <h1>{formatDate(entry.session_date)}</h1>
      <span className={`status status-${entry.status}`}>{entry.status}</span>

      <div className="responses" style={{ marginTop: 16 }}>
        {entry.responses.map((r) => (
          <div key={r.id} className="response-block">
            <h3>{PROMPT_LABELS[r.prompt_key] || r.prompt_key}</h3>
            <p>{r.response_text}</p>
          </div>
        ))}
      </div>

      {ai && (
        <div className="ai-response">
          <h2>Feedback & Guidance</h2>
          {ai.paragraphs}
          {ai.references.length > 0 && (
            <div className="references">
              <h3>References</h3>
              <ol>
                {ai.references.map((r, i) => (
                  <li key={i}>{renderMarkdownItalics(r, `ref${i}`)}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
