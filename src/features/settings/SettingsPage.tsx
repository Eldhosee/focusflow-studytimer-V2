import { useRef, useState } from 'react';
import { Download, Upload, Info, Bell, Keyboard,  Palette, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';
import { settingsRepository, profileRepository } from '../../database/repositories';
import { useToast } from '../../contexts/ToastContext';
import { exportFullBackupAsJSON, exportSessionsAsCSV, importBackupFromJSON } from '../../services/exportService';
import { requestNotificationPermission } from '../../services/notificationService';
import { Modal } from '../../components/ui/Modal';
import { SubjectManager } from './components/SubjectManager';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[color:var(--color-amber)]' : 'bg-white/10'
        }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
      />
    </button>
  );
}

const SHORTCUTS = [
  { key: 'Space', action: 'End session (in Focus Mode)' },
  { key: 'F', action: 'Toggle fullscreen (in Focus Mode)' },
  { key: 'Esc', action: 'Exit fullscreen' },
];

export function SettingsPage() {
  const { profile, settings, refreshProfile, refreshSettings } = useAppData();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const { subjects } = useAppData();
  const saveProfile = async () => {
    if (!profile) return;
    await profileRepository.save({ ...profile, displayName });
    await refreshProfile();
    show('Profile updated.', 'success');
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        show('Notifications permission was not granted.', 'error');
        return;
      }
    }
    await settingsRepository.save({ notificationsEnabled: enabled });
    await refreshSettings();
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importBackupFromJSON(file);
      show(`Imported ${result.sessions} sessions and ${result.subjects} subjects.`, 'success');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Import failed.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <Card>
        <div className="mb-4 flex items-center gap-2">

          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Profile & goal</h3>
        </div>
        <div className="flex flex-col gap-4 sm:max-w-sm">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-amber-dim)]"
            />
          </div>

          <Button variant="primary" onClick={saveProfile} className="self-start">
            Save changes
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen
            size={16}
            className="text-[color:var(--color-amber)]"
          />
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
            Subjects
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[color:var(--color-text-primary)]">
              Manage Subjects
            </p>

            <p className="text-xs text-[color:var(--color-text-muted)]">
              Create, edit and organize the subjects used throughout FocusFlow.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => setSubjectsModalOpen(true)}
          >
            Manage
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Bell size={16} className="text-[color:var(--color-amber)]" />
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Notifications</h3>
        </div>
        <div className="flex flex-col divide-y divide-[color:var(--color-border-soft)]">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-[color:var(--color-text-primary)]">Browser notifications</p>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                Daily reminders, goal completions, and streak nudges.
              </p>
            </div>
            <Toggle checked={Boolean(settings?.notificationsEnabled)} onChange={toggleNotifications} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-[color:var(--color-text-primary)]">Break reminders</p>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                Nudge after long uninterrupted Focus Mode sessions.
              </p>
            </div>
            <Toggle
              checked={Boolean(settings && settings.breakReminderMinutes > 0)}
              onChange={(v) => settingsRepository.save({ breakReminderMinutes: v ? 45 : 0 }).then(refreshSettings)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Keyboard size={16} className="text-[color:var(--color-amber)]" />
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Keyboard shortcuts</h3>
        </div>
        <div className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-[color:var(--color-text-secondary)]">{s.action}</span>
              <kbd className="rounded-md bg-white/[0.06] px-2 py-1 font-[family-name:var(--font-mono)] text-xs text-[color:var(--color-text-primary)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Palette size={16} className="text-[color:var(--color-amber)]" />
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Data</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={<Download size={15} />} onClick={() => exportSessionsAsCSV()}>
            Export sessions (CSV)
          </Button>
          <Button variant="secondary" icon={<Download size={15} />} onClick={() => exportFullBackupAsJSON()}>
            Export full backup (JSON)
          </Button>
          <Button variant="secondary" icon={<Upload size={15} />} onClick={() => fileRef.current?.click()}>
            Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = '';
            }}
          />
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <Info size={16} className="text-[color:var(--color-amber)]" />
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">About</h3>
        </div>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          FocusFlow v1.0 — a local-first study tracker. All data lives in this browser's IndexedDB; nothing is sent
          to a server.
        </p>
      </Card>
      <Modal
        open={subjectsModalOpen}
        onClose={() => setSubjectsModalOpen(false)}
        title="Manage Subjects"
      >
        <SubjectManager />
      </Modal>
    </div>
  );
}
