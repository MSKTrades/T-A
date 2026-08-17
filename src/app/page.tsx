import { db } from "@/db/client";
import { organizations, employees, employeeTypes, workSchedules, awards } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const orgs = await db.select().from(organizations);
  const emps = await db.select().from(employees);
  const types = await db.select().from(employeeTypes);
  const schedules = await db.select().from(workSchedules);
  const awardRows = await db.select().from(awards);

  const typeName = (id: string | null) => types.find((t) => t.id === id)?.typeName ?? "—";
  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name ?? "—";
  const awardName = (id: string | null) => awardRows.find((a) => a.id === id)?.name ?? "—";
  const scheduleName = (id: string | null) => schedules.find((s) => s.id === id)?.name ?? "—";

  return (
    <main className="max-w-5xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-1">T&A App — Sprint 1.1</h1>
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

      <section>
        <h2 className="text-lg font-semibold mb-2">Employees</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Name</th>
              <th>Type</th>
              <th>Schedule</th>
              <th>Award</th>
              <th>Base rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {emps.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="py-1">
                  {e.firstName} {e.lastName}
                </td>
                <td>{typeName(e.employeeTypeId)}</td>
                <td>{scheduleName(e.workScheduleId)}</td>
                <td>{awardName(e.awardId)}</td>
                <td>${e.basePayRate}/hr</td>
                <td>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
