import { useEffect, useState } from "react";
import PageHeader from "../../common/components/dashboard/PageHeader";
import { getStudentMeetings } from "../../services/meetingService";

const formatMeetingDateTime = (value) => {
  if (!value) {
    return "Date not available";
  }

  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-");
  const [hourString, minute = "00"] = timePart.split(":");

  let hour = Number(hourString);
  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${day}/${month}/${year}, ${String(hour).padStart(
    2,
    "0",
  )}:${minute} ${period}`;
};

export default function MyMeetings() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    getStudentMeetings()
      .then(setMeetings)
      .catch((error) => {
        console.error("Unable to load meetings:", error);
      });
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Student"
        title="Online meetings"
        description="Meetings scheduled by your assigned mentor."
      />

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <article
            key={meeting.id}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-bold">
              {meeting.title}
            </h3>

            <p>{meeting.agenda}</p>

            <p className="mt-2">
              {formatMeetingDateTime(meeting.scheduledAt)} ·{" "}
              {meeting.durationMinutes} min
            </p>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
              {meeting.status}
            </span>

            {meeting.status === "SCHEDULED" && (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="ml-3 rounded-lg bg-indigo-600 px-3 py-2 text-white"
              >
                Join meeting
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}