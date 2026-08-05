import { Download, GitBranch, Send, CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../common/components/dashboard/PageHeader";
import AlertMessage from "../../common/components/AlertMessage";
import EmptyState from "../../common/components/EmptyState";
import TaskSubmissionModal from "../components/TaskSubmissionModal";
import { downloadTaskAttachment, getStudentTasks } from "../../services/taskService";
import { getApiErrorMessage } from "../../utils/apiError";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    setError("");
    try { setTasks(await getStudentTasks()); }
    catch (e) { setError(getApiErrorMessage(e, "Unable to load tasks.")); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateSubmission = (submission) => {
    setTasks((current) => current.map((task) =>
      task.id === submission.taskId ? { ...task, status: submission.status, submission } : task,
    ));
  };

  return <div>
    <PageHeader eyebrow="Student" title="My tasks" description="Download assignments, submit a solution file or GitHub link, and view staff feedback." />
    <AlertMessage type="error" message={error} onClose={() => setError("")} />
    {isLoading ? <div className="mt-6 animate-pulse space-y-4">{[1,2,3].map((x)=><div key={x} className="h-48 rounded-2xl bg-slate-200" />)}</div>
      : tasks.length === 0 ? <div className="mt-6"><EmptyState title="No tasks assigned" description="Tasks assigned by your mentor will appear here." /></div>
      : <div className="mt-6 space-y-5">{tasks.map((task) => {
        const status = task.submission?.status || task.status;
        const canSubmit = !task.submission || task.submission.status === "CHANGES_REQUIRED";
        return <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div><h3 className="text-xl font-bold text-slate-900">{task.title}</h3><p className="mt-2 leading-7 text-slate-600">{task.description || "No description."}</p><p className="mt-3 text-sm text-slate-500">Due: {new Date(task.dueAt).toLocaleString("en-IN")}</p></div>
            <StatusBadge status={status} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {task.hasAttachment && <button onClick={() => downloadTaskAttachment(task.id).catch((e)=>setError(getApiErrorMessage(e)))} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold text-slate-700"><Download size={17}/>Download assignment</button>}
            {canSubmit && <button onClick={() => setSelectedTask(task)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white"><Send size={17}/>{task.submission ? "Resubmit solution" : "Submit solution"}</button>}
            {task.submission?.githubUrl && <a href={task.submission.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold text-slate-700"><Github size={17}/>Open GitHub</a>}
          </div>
          {task.submission && <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><p><b>Attempt:</b> {task.submission.attemptNumber} · <b>Submitted:</b> {new Date(task.submission.submittedAt).toLocaleString("en-IN")} · <b>{task.submission.lateSubmission ? "Late" : "On time"}</b></p>{task.submission.staffFeedback && <div className="mt-3 rounded-xl bg-amber-50 p-4 text-amber-900"><p className="font-bold">Staff feedback</p><p className="mt-1">{task.submission.staffFeedback}</p></div>}</div>}
        </article>;
      })}</div>}
    {selectedTask && <TaskSubmissionModal task={selectedTask} onClose={() => setSelectedTask(null)} onSubmitted={updateSubmission} />}
  </div>;
}

function StatusBadge({ status }) {
  const normalized = String(status || "PENDING").toUpperCase();
  const styles = { APPROVED:"bg-emerald-100 text-emerald-700", COMPLETED:"bg-emerald-100 text-emerald-700", SUBMITTED:"bg-blue-100 text-blue-700", UNDER_REVIEW:"bg-indigo-100 text-indigo-700", CHANGES_REQUIRED:"bg-amber-100 text-amber-700", PENDING:"bg-slate-100 text-slate-700" };
  const Icon = normalized === "APPROVED" || normalized === "COMPLETED" ? CheckCircle2 : Clock3;
  return <span className={`inline-flex h-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${styles[normalized] || styles.PENDING}`}><Icon size={15}/>{normalized.replaceAll("_", " ")}</span>;
}
