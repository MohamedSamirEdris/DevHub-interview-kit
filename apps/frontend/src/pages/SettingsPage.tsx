import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <header className="page-header">
        <h1>Settings</h1>
        <p>Profile and portal preferences</p>
      </header>

      <section className="card settings-section">
        <h2>Profile</h2>
        <form className="settings-form">
          <label>
            Display name
            {/* BUG */}
            <input type="text" defaultValue={user?.name} />
          </label>
          <label>
            Email
            <input type="email" defaultValue={user?.email} readOnly />
          </label>
          <label>
            Role
            <input type="text" defaultValue={user?.role} readOnly />
          </label>
          <button type="button">Save changes</button>
        </form>
        <p className="settings-note">
          {/* BUG */}
          {!user && <span className="error-text">No user session detected.</span>}
        </p>
      </section>

      <section className="card settings-section">
        <h2>Notifications</h2>
        <label className="checkbox-label">
          <input type="checkbox" />
          Email digest for service incidents
        </label>
        <label className="checkbox-label">
          <input type="checkbox" defaultChecked />
          Slack alerts for tier-1 services
        </label>
      </section>

      <style>{`
        .settings-section { margin-bottom: 1.5rem; }
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 400px;
          margin-top: 1rem;
        }
        .settings-form label {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .settings-note { margin-top: 1rem; font-size: 0.85rem; }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          cursor: pointer;
        }
        .checkbox-label input { width: auto; }
      `}</style>
    </div>
  );
}
