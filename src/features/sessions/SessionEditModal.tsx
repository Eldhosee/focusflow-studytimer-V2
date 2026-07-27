import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import type { StudySession } from '../../types/models';
import { sessionEditSchema, type SessionEditForm } from '../../utils/validation';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../contexts/AppDataContext';

interface SessionEditModalProps {
  session: StudySession | null;
  onClose: () => void;
  onSave: (id: string, changes: Partial<StudySession>) => void;
}

export function SessionEditModal({ session, onClose, onSave }: SessionEditModalProps) {
  const { subjects } = useAppData();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionEditForm>({ resolver: zodResolver(sessionEditSchema) });

  useEffect(() => {
    if (session) {
      reset({ subject: session.subject, notes: session.notes, tags: session.tags.join(', ') });
    }
  }, [session, reset]);

  if (!session) return null;

  const onSubmit = (data: SessionEditForm) => {
    onSave(session.id, {
      subject: data.subject,
      notes: data.notes ?? '',
      tags: (data.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
  };

  return (
    <Modal open={Boolean(session)} onClose={onClose} title="Edit session">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">Subject</label>
          <select
            {...register('subject')}
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-amber-dim)]"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.name} className="bg-[#14141F]">
                {s.name}
              </option>
            ))}
          </select>
          {errors.subject && <p className="mt-1 text-xs text-[color:var(--color-danger)]">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">Notes</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full resize-none rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-amber-dim)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">
            Tags <span className="text-[color:var(--color-text-muted)]">(comma separated)</span>
          </label>
          <input
            {...register('tags')}
            placeholder="revision, deep-work"
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-amber-dim)]"
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
