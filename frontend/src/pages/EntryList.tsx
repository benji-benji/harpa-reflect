import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { JournalEntryListItem } from '../types/api';
import { getEntries } from '../services/api';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function EntryList() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<JournalEntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getEntries().then(setEntries).finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="entry-list">
      <div className="app-header">
        <div className="app-title">HarPA Reflect</div>
        <div className="app-subtitle">Playwork reflections</div>
      </div>

      <div className="nav-bar">
        <span className="user-info">{user?.display_name ?? 'Staff'}</span>
        <button type="button" onClick={handleLogout}>Log out</button>
      </div>

      <h1>Journal Entries</h1>
      <Link to="/journal/new" className="new-entry-link">New Entry</Link>

      {isLoading ? (
        <p style={{ marginTop: 24, textAlign: 'center', color: '#888' }}>Loading...</p>
      ) : entries.length === 0 ? (
        <p style={{ marginTop: 24, textAlign: 'center', color: '#888' }}>
          No entries yet. Start your first reflection.
        </p>
      ) : (
        <ul style={{ marginTop: 16 }}>
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link to={`/entries/${entry.id}`}>
                <span className="date">{formatDate(entry.session_date)}</span>
                <span className={`status status-${entry.status}`}>{entry.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
