import {
  FileUp,
  GitBranch,
  LoaderCircle,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { submitTaskSolution } from "../../services/taskService";
import { getApiErrorMessage } from "../../utils/apiError";

export default function TaskSubmissionModal({ task, onClose, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState(task.submission?.githubUrl || "");
  const [note, setNote] = useState(task.submission?.submissionNote || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!file && !githubUrl.trim()) {
      setError("Upload a solution file or provide a GitHub repository link.");
      return;
    }
    if (file && file.size > 20 * 1024 * 1024) {
      setError("File size must not exceed 20 MB.");
      return;
    }
    if (githubUrl.trim() && !githubUrl.trim().startsWith("https://github.com/")) {
      setError("Use a secure GitHub URL beginning with https://github.com/.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitTaskSolution({ taskId: task.id, githubUrl, note, file });
      onSubmitted(response);
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to submit your solution."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-950/60" />
      <form onSubmit={submit} className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Task submission</p><h2 className="mt-1 text-2xl font-bold">{task.title}</h2></div>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-xl p-2 hover:bg-slate-100"><X size={22} /></button>
        </div>
        <div className="space-y-6 p-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {task.allowFileSubmission !== false && <div>
            <label className="mb-2 block text-sm font-semibold">Upload solution</label>
            <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-indigo-400 hover:bg-indigo-50">
              <FileUp size={34} className="text-indigo-600" /><span className="mt-3 font-semibold">Choose PDF, document, ZIP or image</span><span className="text-sm text-slate-500">Maximum 20 MB</span>
              <input type="file" accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            {file && <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm font-semibold">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
          </div>}
          {task.allowGithubSubmission !== false && <div>
            <label className="mb-2 block text-sm font-semibold">GitHub repository URL</label>
            <div className="relative">
                <GitBranch
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username/project" className="w-full rounded-xl border py-3.5 pl-12 pr-4 outline-none focus:border-indigo-500" /></div>
          </div>}
          <div><label className="mb-2 block text-sm font-semibold">Submission note</label><textarea rows="4" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" placeholder="Explain setup or important details." /></div>
        </div>
        <div className="flex justify-end gap-3 border-t p-6"><button type="button" onClick={onClose} className="rounded-xl border px-5 py-3 font-semibold">Cancel</button><button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:bg-indigo-400">{isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}{isSubmitting ? "Submitting..." : task.submission ? "Resubmit solution" : "Submit solution"}</button></div>
      </form>
    </div>
  );
}
