import { z } from 'zod';

export const sessionEditSchema = z.object({
  subject: z.string().min(1, 'Pick a subject'),
  notes: z.string().max(2000, 'Keep notes under 2000 characters').optional(),
  tags: z.string().max(200, 'Keep tags under 200 characters').optional(),
});
export type SessionEditForm = z.infer<typeof sessionEditSchema>;

export const goalFormSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  targetMinutes: z.number().min(5, 'At least 5 minutes').max(1440, 'Under 24 hours'),
  label: z.string().max(60).optional(),
});
export type GoalForm = z.infer<typeof goalFormSchema>;

export const subjectFormSchema = z.object({
  name: z.string().min(1, 'Give it a name').max(40, 'Keep it under 40 characters'),
  color: z.string().min(1),
});
export type SubjectForm = z.infer<typeof subjectFormSchema>;
