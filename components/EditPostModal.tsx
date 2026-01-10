import { FormEvent } from "react";

interface PostTypeOption {
  key: string;
  value: string;
}

interface EditPostModalProps {
  open: boolean;
  editContent: string;
  editPostType: string;
  postTypeOptions: PostTypeOption[];
  editError: string;
  editSubmitting: boolean;
  editAction: "save" | "delete" | null;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
  onChangeContent: (value: string) => void;
  onChangeType: (value: string) => void;
}

export function EditPostModal({
  open,
  editContent,
  editPostType,
  postTypeOptions,
  editError,
  editSubmitting,
  editAction,
  onClose,
  onSubmit,
  onDelete,
  onChangeContent,
  onChangeType,
}: EditPostModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xl sm:max-w-2xl border-4 border-blue-400/70 relative mx-2">
        <button
          className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-3xl font-bold transition-colors duration-150"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-tight drop-shadow">Edit Post</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <textarea
            className="w-full border-2 border-blue-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none text-lg shadow-sm"
            rows={4}
            placeholder="Edit your post..."
            value={editContent}
            onChange={e => onChangeContent(e.target.value)}
            required
          />
          <div>
            <label className="block font-semibold mb-2 text-blue-700">Type</label>
            <select
              className="w-full border-2 border-blue-400 focus:border-blue-600 rounded-lg px-4 py-2 bg-white/80 focus:bg-blue-50 transition-all duration-200 outline-none font-semibold text-blue-700"
              value={editPostType}
              onChange={e => onChangeType(e.target.value)}
            >
              {postTypeOptions.map(opt => (
                <option key={opt.key} value={opt.value}>
                  {opt.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          {editError && (
            <div className="text-red-500 text-sm text-center font-semibold">
              {editError}
            </div>
          )}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
              disabled={editSubmitting || !editContent.trim()}
            >
              {editAction === "save" && editSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="flex-1 bg-white border-2 border-red-400 text-red-600 font-bold px-8 py-3 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-50 hover:border-red-600"
              onClick={onDelete}
              disabled={editSubmitting}
            >
              {editAction === "delete" && editSubmitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
