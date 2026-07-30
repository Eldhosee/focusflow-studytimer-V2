import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useAppData } from "../../../contexts/AppDataContext";

const COLORS = [
  
  "#7c83fd",
  "#5fd9a4",
  "#e9707a",
  "#61c7f2",
  "#c98bf5",
];

export function SubjectManager() {
  const { subjects, addSubject, deleteSubject } = useAppData();

  const [subjectName, setSubjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const [error, setError] = useState("");

  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [deleteSubjectName, setDeleteSubjectName] = useState("");

  const handleAddSubject = async () => {
    try {
      await addSubject(subjectName, selectedColor);

      setSubjectName("");
      setSelectedColor(COLORS[0]);
      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteSubjectId(id);
    setDeleteSubjectName(name);
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectId) return;

    try {
      await deleteSubject(deleteSubjectId);

      setDeleteSubjectId(null);
      setDeleteSubjectName("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">
            Subjects ({subjects.length})
          </h3>

          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
            Create, edit and organize the subjects used throughout FocusFlow.
          </p>
        </div>

        {/* Add Subject */}
        <div className="space-y-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Subject Name
            </label>

            <input
              type="text"
              value={subjectName}
              onChange={(e) => {
                setSubjectName(e.target.value);
                setError("");
              }}
              placeholder="Enter subject name..."
              className={`w-full rounded-lg border bg-transparent px-3 py-2 outline-none transition-colors ${error
                  ? "border-red-500"
                  : "border-[color:var(--color-border)] focus:border-[color:var(--color-amber)]"
                }`}
            />

            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Choose Color
            </label>

            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor === color
                      ? "scale-110 border-white"
                      : "border-transparent hover:scale-105"
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddSubject}>
              Add Subject
            </Button>
          </div>
        </div>

        {/* Subject List */}
        <div className="space-y-3">
          {subjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-8 text-center">
              <p className="text-sm text-[color:var(--color-text-muted)]">
                No subjects yet.
              </p>
            </div>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />

                  <span className="font-medium">
                    {subject.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {subject.name === "General Study" ? (
                    <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-muted)]">
                      Default
                    </span>
                  ) : (
                    <>
                      <Button variant="secondary" disabled>
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() =>
                          openDeleteDialog(subject.id, subject.name)
                        }
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        open={deleteSubjectId !== null}
        onClose={() => {
          setDeleteSubjectId(null);
          setDeleteSubjectName("");
        }}
        title="Delete Subject"
      >
        <div className="space-y-6">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[color:var(--color-text)]">
              {deleteSubjectName}
            </span>
            ?
          </p>

          <p className="text-sm text-red-500">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteSubjectId(null);
                setDeleteSubjectName("");
              }}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteSubject}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}