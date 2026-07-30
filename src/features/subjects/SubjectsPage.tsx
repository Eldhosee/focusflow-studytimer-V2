import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAppData } from "../../contexts/AppDataContext";

export function SubjectsPage() {
  const { subjects } = useAppData();

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold">
              Subjects
            </h2>

            <p className="text-sm text-[color:var(--color-text-muted)]">
              Manage the subjects used throughout FocusFlow.
            </p>
          </div>

          <Button variant="primary">
            + Add Subject
          </Button>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />

                <span>{subject.name}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary">
                  Edit
                </Button>

                <Button variant="danger">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}