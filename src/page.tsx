import Link from "next/link";
import { db } from "@/db/client";
import {
  organizations,
  employees,
  employeeTypes,
  workSchedules,
  awards,
  workScheduleAssignments,
} from "@/db/schema";

export const dynamic = "force-dynamic";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default async function Home() {
  const orgs = await db.select().from(organizations);
  const emps = await db.select().from(employees);
  const types = await db.select().from(employeeTypes);
  const schedules = await db.select().from(workSchedules);
  const awardRows = await db.select().from(awards);
  const assignments = await db.select().from(workScheduleAssignments);

  const typeName = (id: string | null) => types.find((t) => t.id === id)?.typeName ?? "—";
  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name ?? "—";
  const awardName = (id: string | null) => awardRows.find((a) => a.id === id)?.name ?? "—";
  const scheduleName = (id: string | null) => schedules.find((s) => s.id === id)?.name ?? "—";

  // Resolve each employee's schedule as of today: the assignment row whose date range
  // covers today. Temporary assignments (with an endDate) win over the permanent one while
  // they're active; once the endDate passes, the permanent row (no endDate) applies again.
  const today = todayStr();
  const currentAssignment = (employeeId: string) => {
    const rows = assignments
      .filter((a) => a.employeeId === employeeId)
      .filter((a) => a.startDate <= today && (!a.endDate || a.endDate >= today))
      .sort((a, b) => (a.assignmentType === "temporary" ? -1 : 1)); // temporary wins if both somehow match
    return rows[0];
  };

  return (
    <main className="max-w-5xl mx-auto p-8 font-sans">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">T&A App — Sprint 1.1</h1>
        <Link href="/manage" className="text-sm text-blue-600 underline">
          + Add / manage records
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Organization, EmployeeType, WorkSchedule, Award, Employee — basic CRUD, seeded from the SOW.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Organizations</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Name</th>
              <th>Jurisdiction</th>
              <th>Timezone</th>
              <th>Default geofence policy</th>
              <th>Default TOIL multiplier</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-1">{o.name}</td>
                <td>{o.primaryJurisdiction}</td>
                <td>{o.timezone}</td>
                <td>{o.defaultGeofencePolicy}</td>
                <td>{o.defaultToilBankingMultiplier}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Awards</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Name</th>
              <th>Org</th>
              <th>Jurisdiction</th>
              <th>Default TOIL multiplier</th>
            </tr>
          </thead>
          <tbody>
            {awardRows.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="py-1">{a.name}</td>
                <td>{orgName(a.orgId)}</td>
                <td>{a.jurisdiction}</td>
                <td>{a.defaultToilBankingMultiplier}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Work Schedules</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Name</th>
              <th>Daily hrs</th>
              <th>Weekly hrs</th>
              <th>Bandwidth</th>
              <th>Days</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-1">{s.name}</td>
                <td>{s.standardDailyHours}</td>
                <td>{s.standardWeeklyHours}</td>
                <td>
                  {s.bandwidthStart} – {s.bandwidthEnd}
                </td>
                <td>{s.daysPattern}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Employees</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Name</th>
              <th>Type</th>
              <th>Current schedule (as of today)</th>
              <th>Award</th>
              <th>Base rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {emps.map((e) => {
              const assignment = currentAssignment(e.id);
              return (
                <tr key={e.id} className="border-b">
                  <td className="py-1">
                    {e.firstName} {e.lastName}
                  </td>
                  <td>{typeName(e.employeeTypeId)}</td>
                  <td>
                    {assignment ? scheduleName(assignment.workScheduleId) : "— none assigned —"}
                    {assignment?.assignmentType === "temporary" && (
                      <span className="ml-1 text-xs text-orange-600">
                        (temporary, until {assignment.endDate})
                      </span>
                    )}
                  </td>
                  <td>{awardName(e.awardId)}</td>
                  <td>${e.basePayRate}/hr</td>
                  <td>{e.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Work schedule assignment history</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Employee</th>
              <th>Schedule</th>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => {
              const emp = emps.find((e) => e.id === a.employeeId);
              return (
                <tr key={a.id} className="border-b">
                  <td className="py-1">{emp ? `${emp.firstName} ${emp.lastName}` : "—"}</td>
                  <td>{scheduleName(a.workScheduleId)}</td>
                  <td>{a.assignmentType}</td>
                  <td>{a.startDate}</td>
                  <td>{a.endDate ?? "(ongoing)"}</td>
                  <td>{a.reason ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
