import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MoodSelector from '../components/MoodSelector';
import VoiceRecorder from '../components/VoiceRecorder';
import type { EntryResponseIn, PromptDefinition } from '../types/api';
import { createEntry, completeEntry, getActiveGoal, recordMood } from '../services/api';

const PROMPTS: PromptDefinition[] = [
  { prompt_key: 'session_context', text: 'What session are you reflecting on? (date, time, roughly how many young people)' },
  { prompt_key: 'highlights', text: 'What went well today? What moments stood out?' },
  { prompt_key: 'challenges', text: "What was difficult or didn't go as you'd hoped?" },
  { prompt_key: 'observations', text: 'Did you notice anything interesting about how the young people were playing today?' },
  { prompt_key: 'interventions', text: 'Did you step in or hold back at any point? What made you decide?' },
  { prompt_key: 'goal_checkin', text: "You said you're working on: {goal}. How did that go today?", requires_goal: true },
  { prompt_key: 'mood', text: 'How are you feeling after today\'s session?' },
  { prompt_key: 'anything_else', text: 'Anything else on your mind about today?' },
];

export default function JournalFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<EntryResponseIn[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [activeGoal, setActiveGoal] = useState<{ goal_text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getActiveGoal().then(setActiveGoal).catch(() => {});
  }, []);

  const visiblePrompts = PROMPTS.filter(
    (p) => !p.requires_goal || activeGoal
  );

  const currentPrompt = visiblePrompts[step];

  const getPromptText = (prompt: PromptDefinition) => {
    if (prompt.requires_goal && activeGoal) {
      return prompt.text.replace('{goal}', activeGoal.goal_text);
    }
    return prompt.text;
  };

  const handleNext = async () => {
    const newResponses = [...responses];
    if (currentPrompt.prompt_key === 'mood') {
      newResponses.push({
        prompt_key: currentPrompt.prompt_key,
        response_text: String(moodScore ?? 3),
      });
    } else {
      newResponses.push({
        prompt_key: currentPrompt.prompt_key,
        response_text: currentText,
      });
    }
    setResponses(newResponses);
    setCurrentText('');
    setMoodScore(null);

    if (step + 1 >= visiblePrompts.length) {
      setIsSubmitting(true);
      try {
        const entry = await createEntry({
          session_date: new Date().toISOString().split('T')[0],
          responses: newResponses,
        });

        if (moodScore) {
          await recordMood({
            session_date: new Date().toISOString().split('T')[0],
            mood_score: moodScore,
            entry_id: entry.id,
          });
        }

        await completeEntry(entry.id);
        navigate(`/entries/${entry.id}`);
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleTranscript = (text: string) => {
    setCurrentText((prev) => (prev ? `${prev} ${text}` : text));
  };

  if (isSubmitting) {
    return (
      <div className="journal-flow">
        <p className="prompt-text">Generating feedback and guidance...</p>
      </div>
    );
  }

  if (!currentPrompt) {
    return <div className="journal-flow"><p>Complete!</p></div>;
  }

  return (
    <div className="journal-flow">
      <p className="prompt-text">{getPromptText(currentPrompt)}</p>

      {currentPrompt.prompt_key === 'mood' ? (
        <MoodSelector value={moodScore} onChange={setMoodScore} />
      ) : (
        <textarea
          role="textbox"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder="Type your response..."
        />
      )}

      <div className="actions">
        <VoiceRecorder onTranscript={handleTranscript} />
        <button type="button" onClick={handleNext}>
          {step + 1 >= visiblePrompts.length ? 'Submit' : 'Next'}
        </button>
      </div>

      <p className="step-indicator">
        {step + 1} of {visiblePrompts.length}
      </p>
    </div>
  );
}
