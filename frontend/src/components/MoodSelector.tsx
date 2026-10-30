interface MoodSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

const MOOD_LABELS = ['Very low', 'Low', 'OK', 'Good', 'Great'];

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="mood-selector">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          aria-label={`${score}`}
          className={`mood-btn${value === score ? ' selected' : ''}`}
          onClick={() => onChange(score)}
        >
          {MOOD_LABELS[score - 1]}
        </button>
      ))}
    </div>
  );
}
