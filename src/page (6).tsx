"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Org = { id: string; name: string; primaryJurisdiction: string };
type EmployeeType = { id: string; orgId: string; typeName: string };
type WorkSchedule = { id: string; orgId: string; name: string };
type Award = { id: string; orgId: string; name: string };
type Employee = { id: string; orgId: string; firstName: string; lastName: string };

async function postJson(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export default function ManagePage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [types, setTypes] = useState<EmployeeType[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [awardsList, setAwardsList] = useState<Award[]>([]);
  const [emps, setEmps] = useState<Employee[]>([]);
  const [message, setMessage] = useState<string>("");

  const reload = useCallback(async () => {
    const [o, t, s, a, e] = await Promise.all([
      fetch("/api/organizations").then((r) => r.json()),
      fetch("/api/employee-types").then((r) => r.json()),
      fetch("/api/work-schedules").then((r) => r.json()),
      fetch("/api/awards").then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ]);
    setOrgs(o);
    setTypes(t);
    setSchedules(s);
    setAwardsList(a);
    setEmps(e);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  function notify(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    url: string,
    transform: (fd: FormData) => object
  ) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await postJson(url, transform(fd));
      notify("Saved.");
      e.currentTarget.reset();
      await reload();
    } catch (err) {
      notify(`Error: ${(err as Error).message}`);
    }
  }

  const inputCls = "border rounded px-2 py-1 text-sm w-full";
  const labelCls = "text-xs text-gray-600 block mb-1";
  const fieldCls = "mb-2";
  const formCls = "border rounded p-4 mb-8 bg-gray-50";
  const btnCls = "bg-black text-white text-sm rounded px-3 py-1.5 mt-2";

  return (
    <main className="max-w-3xl mx-auto p-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage records</h1>
        <Link href="/" className="text-sm text-blue-600 underline">
          ← back to overview
        </Link>
      </div>

      {message && (
        <div className="mb-4 text-sm px-3 py-2 rounded bg-blue-50 border border-blue-200">
          {message}
        </div>
      )}

      {/* Organization */}
      <form
        className={formCls}
        onSubmit={(e) =>
          handleSubmit(e, "/api/organizations", (fd) => ({
            name: fd.get("name"),
            primaryJurisdiction: fd.get("primaryJurisdiction"),
          }))
        }
      >
        <h2 className="font-semibold mb-3">Add Organization</h2>
        <div className={fieldCls}>
          <label className={labelCls}>Name</label>
          <input name="name" required className={inputCls} />
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Primary jurisdiction</label>
          <input name="primaryJurisdiction" required defaultValue="Australia" className={inputCls} />
        </div>
        <button className={btnCls}>Add Organization</button>
      </form>

      {/* Employee Type */}
      <form
        className={formCls}
        onSubmit={(e) =>
          handleSubmit(e, "/api/employee-types", (fd) => ({
            orgId: fd.get("orgId"),
            typeName: fd.get("typeName"),
            flextimeEligible: fd.get("flextimeEligible") === "on",
            toilEligible: fd.get("toilEligible") === "on",
            casualLoadingPct: fd.get("casualLoadingPct") ? Number(fd.get("casualLoadingPct")) : null,
          }))
        }
      >
        <h2 className="font-semibold mb-3">Add Employee Type</h2>
        <div className={fieldCls}>
          <label className={labelCls}>Organization</label>
          <select name="orgId" required className={inputCls}>
            <option value="">— select —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Type name (e.g. Permanent, Casual, Temporary)</label>
          <input name="typeName" required className={inputCls} />
        </div>
        <div className={fieldCls}>
          <label className="text-sm mr-4">
            <input type="checkbox" name="flextimeEligible" className="mr-1" />
            Flextime eligible
          </label>
          <label className="text-sm">
            <input type="checkbox" name="toilEligible" className="mr-1" />
            TOIL eligible
          </label>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Casual loading % (leave blank if not casual)</label>
          <input name="casualLoadingPct" type="number" step="0.1" className={inputCls} />
        </div>
        <button className={btnCls}>Add Employee Type</button>
      </form>

      {/* Work Schedule */}
      <form
        className={formCls}
        onSubmit={(e) =>
          handleSubmit(e, "/api/work-schedules", (fd) => ({
            orgId: fd.get("orgId"),
            name: fd.get("name"),
            standardDailyHours: Number(fd.get("standardDailyHours")),
            standardWeeklyHours: Number(fd.get("standardWeeklyHours")),
            bandwidthStart: fd.get("bandwidthStart") || null,
            bandwidthEnd: fd.get("bandwidthEnd") || null,
            daysPattern: fd.get("daysPattern") || "Mon-Fri",
          }))
        }
      >
        <h2 className="font-semibold mb-3">Add Work Schedule</h2>
        <div className={fieldCls}>
          <label className={labelCls}>Organization</label>
          <select name="orgId" required className={inputCls}>
            <option value="">— select —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Name</label>
          <input name="name" required className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={fieldCls}>
            <label className={labelCls}>Standard daily hours</label>
            <input name="standardDailyHours" type="number" step="0.5" required className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Standard weekly hours</label>
            <input name="standardWeeklyHours" type="number" step="0.5" required className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Bandwidth start (e.g. 07:30)</label>
            <input name="bandwidthStart" className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Bandwidth end (e.g. 18:00)</label>
            <input name="bandwidthEnd" className={inputCls} />
          </div>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Days pattern</label>
          <input name="daysPattern" defaultValue="Mon-Fri" className={inputCls} />
        </div>
        <button className={btnCls}>Add Work Schedule</button>
      </form>

      {/* Award */}
      <form
        className={formCls}
        onSubmit={(e) =>
          handleSubmit(e, "/api/awards", (fd) => ({
            orgId: fd.get("orgId"),
            name: fd.get("name"),
            jurisdiction: fd.get("jurisdiction"),
          }))
        }
      >
        <h2 className="font-semibold mb-3">Add Award</h2>
        <div className={fieldCls}>
          <label className={labelCls}>Organization</label>
          <select name="orgId" required className={inputCls}>
            <option value="">— select —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Name</label>
          <input name="name" required className={inputCls} />
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Jurisdiction</label>
          <input name="jurisdiction" required defaultValue="Australia" className={inputCls} />
        </div>
        <button className={btnCls}>Add Award</button>
      </form>

      {/* Employee */}
      <form
        className={formCls}
        onSubmit={(e) =>
          handleSubmit(e, "/api/employees", (fd) => ({
            orgId: fd.get("orgId"),
            employeeTypeId: fd.get("employeeTypeId"),
            awardId: fd.get("awardId") || null,
            workScheduleId: fd.get("workScheduleId") || null,
            firstName: fd.get("firstName"),
            lastName: fd.get("lastName"),
            basePayRate: Number(fd.get("basePayRate")),
            employmentStartDate: fd.get("employmentStartDate"),
          }))
        }
      >
        <h2 className="font-semibold mb-3">Add Employee</h2>
        <div className={fieldCls}>
          <label className={labelCls}>Organization</label>
          <select name="orgId" required className={inputCls}>
            <option value="">— select —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={fieldCls}>
            <label className={labelCls}>First name</label>
            <input name="firstName" required className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Last name</label>
            <input name="lastName" required className={inputCls} />
          </div>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Employee type</label>
          <select name="employeeTypeId" required className={inputCls}>
            <option value="">— select —</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.typeName}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Award</label>
          <select name="awardId" className={inputCls}>
            <option value="">— none —</option>
            {awardsList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Starting work schedule (permanent)</label>
          <select name="workScheduleId" className={inputCls}>
            <option value="">— none —</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={fieldCls}>
            <label className={labelCls}>Base pay rate ($/hr)</label>
            <input name="basePayRate" type="number" step="0.01" required className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Employment start date</label>
            <input name="employmentStartDate" type="date" required className={inputCls} />
          </div>
        </div>
        <button className={btnCls}>Add Employee</button>
      </form>

      {/* Work Schedule Assignment (temporary or permanent) */}
      <form
        className={formCls}
        onSubmit={(e) =>
          handleSubmit(e, "/api/work-schedule-assignments", (fd) => ({
            orgId: fd.get("orgId"),
            employeeId: fd.get("employeeId"),
            workScheduleId: fd.get("workScheduleId"),
            startDate: fd.get("startDate"),
            endDate: fd.get("endDate") || null,
            reason: fd.get("reason") || null,
          }))
        }
      >
        <h2 className="font-semibold mb-3">Move employee to a work schedule</h2>
        <p className="text-xs text-gray-600 mb-3">
          Leave &quot;end date&quot; blank for a permanent change. Set an end date for a
          temporary move (e.g. covering a few days on a different pattern) — the employee
          automatically reverts to their prior schedule once the end date passes.
        </p>
        <div className={fieldCls}>
          <label className={labelCls}>Organization</label>
          <select name="orgId" required className={inputCls}>
            <option value="">— select —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Employee</label>
          <select name="employeeId" required className={inputCls}>
            <option value="">— select —</option>
            {emps.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>New work schedule</label>
          <select name="workScheduleId" required className={inputCls}>
            <option value="">— select —</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={fieldCls}>
            <label className={labelCls}>Start date</label>
            <input name="startDate" type="date" required className={inputCls} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>End date (blank = permanent)</label>
            <input name="endDate" type="date" className={inputCls} />
          </div>
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Reason (optional)</label>
          <input name="reason" placeholder="e.g. covering night shift for Project X" className={inputCls} />
        </div>
        <button className={btnCls}>Save schedule change</button>
      </form>
    </main>
  );
}
