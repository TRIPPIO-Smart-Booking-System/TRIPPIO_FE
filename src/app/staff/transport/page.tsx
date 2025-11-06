'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAuth } from '@/lib/auth';

/* ================== Types & Const ================== */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

export type ApiTransportTrip = {
  id: string;
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  price: number;
  availableSeats: number;
  dateCreated: string;
  modifiedDate: string | null;
  transport: null | unknown;
};

export type ApiTransport = {
  id: string;
  transportType: string; // Airline | Train | Bus | ...
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
};

type Filters = { type: string; q: string };

type EditForm = {
  id: string;
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string; // datetime-local (YYYY-MM-DDTHH:mm)
  arrivalTime: string; // datetime-local
  price: string; // input text -> convert Number when submit
  availableSeats: string; // input text -> convert Number when submit
};

/* ================== Helpers ================== */

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}
function errMsg(e: unknown) {
  return e instanceof Error ? e.message : 'Đã xảy ra lỗi';
}
function fmtDate(d: string) {
  const n = new Date(d);
  return Number.isNaN(n.getTime()) ? d : n.toLocaleString('vi-VN');
}

/** Convert ISO -> datetime-local value (trim seconds/ms & keep local time) */
function toLocalInputValue(iso: string): string {
  if (!iso) return '';
  const dt = new Date(iso);
  if (isNaN(+dt)) return '';
  // Build yyyy-MM-ddTHH:mm in local time
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = dt.getFullYear();
  const mm = pad(dt.getMonth() + 1);
  const dd = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mi = pad(dt.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** Convert datetime-local -> ISO (assume local time input) */
function fromLocalInputValue(local: string): string {
  // new Date(local) treats as local time; then toISOString()
  const d = new Date(local);
  if (isNaN(+d)) return local; // fallback raw if invalid
  return d.toISOString();
}

function rankType(t: string) {
  const r: Record<string, number> = { Airline: 1, Train: 2, Bus: 3 };
  return r[t] ?? 9;
}

/* ================== Page ================== */

export default function TransportManagePage() {
  const [rows, setRows] = useState<ApiTransport[]>([]);
  const [trips, setTrips] = useState<ApiTransportTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({ type: '', q: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [rt, rtr] = await Promise.all([
        fetch(`${API_BASE}/api/Transport`, {
          cache: 'no-store',
          credentials: 'include',
          headers: authHeaders(),
        }),
        fetch(`${API_BASE}/api/TransportTrip`, {
          cache: 'no-store',
          credentials: 'include',
          headers: authHeaders(),
        }),
      ]);
      if (!rt.ok) throw new Error(`Transport HTTP ${rt.status}`);
      if (!rtr.ok) throw new Error(`TransportTrip HTTP ${rtr.status}`);

      const tJson: unknown = await rt.json();
      const tripsJson: unknown = await rtr.json();

      setRows(Array.isArray(tJson) ? (tJson as ApiTransport[]) : []);
      setTrips(Array.isArray(tripsJson) ? (tripsJson as ApiTransportTrip[]) : []);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // map trips theo transport
  const tripByTransport = useMemo(() => {
    const m = new Map<string, ApiTransportTrip[]>();
    for (const tr of trips) {
      const arr = m.get(tr.transportId) ?? [];
      arr.push(tr);
      m.set(tr.transportId, arr);
    }
    // sort mỗi nhóm theo thời gian khởi hành
    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => +new Date(a.departureTime) - +new Date(b.departureTime));
      m.set(k, arr);
    }
    return m;
  }, [trips]);

  const types = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.transportType && s.add(r.transportType));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const view = useMemo(() => {
    const { type, q } = filters;
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => !type || r.transportType === type)
      .filter((r) => {
        if (!qq) return true;
        return (
          r.name.toLowerCase().includes(qq) ||
          r.transportType.toLowerCase().includes(qq) ||
          (tripByTransport.get(r.id) ?? []).some(
            (tr) =>
              tr.departure.toLowerCase().includes(qq) || tr.destination.toLowerCase().includes(qq)
          )
        );
      })
      .sort(
        (a, b) =>
          rankType(a.transportType) - rankType(b.transportType) || a.name.localeCompare(b.name)
      );
  }, [rows, tripByTransport, filters]);

  const totalTrips = useMemo(
    () => view.reduce((s, r) => s + (tripByTransport.get(r.id)?.length ?? 0), 0),
    [view, tripByTransport]
  );

  /* ================== Edit Modal Logic ================== */

  function openEdit(trip: ApiTransportTrip) {
    setSaveErr(null);
    setEditForm({
      id: trip.id,
      transportId: trip.transportId,
      departure: trip.departure,
      destination: trip.destination,
      departureTime: toLocalInputValue(trip.departureTime),
      arrivalTime: toLocalInputValue(trip.arrivalTime),
      price: String(trip.price),
      availableSeats: String(trip.availableSeats),
    });
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditForm(null);
    setSaveErr(null);
  }

  async function submitEdit() {
    if (!editForm) return;
    setSaving(true);
    setSaveErr(null);
    try {
      // basic validations
      if (!editForm.transportId) throw new Error('Vui lòng chọn Transport.');
      if (!editForm.departure.trim()) throw new Error('Vui lòng nhập điểm đi.');
      if (!editForm.destination.trim()) throw new Error('Vui lòng nhập điểm đến.');
      if (!editForm.departureTime) throw new Error('Vui lòng chọn thời gian khởi hành.');
      if (!editForm.arrivalTime) throw new Error('Vui lòng chọn thời gian đến.');
      const price = Number(editForm.price);
      const seats = Number(editForm.availableSeats);
      if (!Number.isFinite(price) || price < 0) throw new Error('Giá không hợp lệ.');
      if (!Number.isInteger(seats) || seats < 0) throw new Error('Số chỗ không hợp lệ.');

      // IMPORTANT: include BOTH transportId and transport: { id } to satisfy [Required] Transport
      const body = {
        id: editForm.id,
        transportId: editForm.transportId,
        transport: { id: editForm.transportId },

        departure: editForm.departure.trim(),
        destination: editForm.destination.trim(),
        departureTime: fromLocalInputValue(editForm.departureTime),
        arrivalTime: fromLocalInputValue(editForm.arrivalTime),
        price,
        availableSeats: seats,
      };

      const resp = await fetch(`${API_BASE}/api/TransportTrip/${encodeURIComponent(editForm.id)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        // attempt to pick ModelState validation
        try {
          const j = JSON.parse(text);
          const valMsg = j?.errors ? Object.values(j.errors).flat().join('; ') : j?.title || text;
          throw new Error(`HTTP ${resp.status} - ${valMsg}`);
        } catch {
          throw new Error(`HTTP ${resp.status} - ${text}`);
        }
      }

      // success -> update local state
      setTrips((prev) =>
        prev.map((t) =>
          t.id === editForm.id
            ? {
                ...t,
                transportId: body.transportId,
                departure: body.departure,
                destination: body.destination,
                departureTime: body.departureTime,
                arrivalTime: body.arrivalTime,
                price: body.price,
                availableSeats: body.availableSeats,
              }
            : t
        )
      );
      closeEdit();
    } catch (e) {
      setSaveErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  /* ================== UI ================== */

  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-sky-100/60 via-teal-100/40 to-transparent"
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:max-w-7xl">
        {/* Header */}
        <header className="mb-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-sky-800 md:text-3xl">
                🧭 Quản lý Transport
              </h1>
              <p className="mt-1 text-sky-900/80">
                Tạo hãng/tuyến và gắn các chuyến (TransportTrip) cho từng transport.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-600/10 px-3 py-1 text-sm font-semibold text-sky-800">
                {view.length} transport • {totalTrips} trip
              </span>
              <a
                href="/staff/transport/new"
                className="rounded-2xl bg-sky-600 px-4 py-2 font-semibold text-white shadow hover:brightness-105"
              >
                + Tạo Transport
              </a>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-4 rounded-3xl border border-white/60 bg-white/90 p-4 shadow backdrop-blur">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="mb-1 text-xs text-sky-900/70">Loại</div>
              <select
                value={filters.type}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value="">Tất cả</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs text-sky-900/70">Tìm kiếm</div>
              <input
                placeholder="Tên hãng, loại, điểm đi/đến của trip…"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
          </div>
        </div>

        {/* Table/List */}
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow backdrop-blur">
          {loading ? (
            <div className="p-4 text-sm text-sky-900/80">Đang tải…</div>
          ) : err ? (
            <div className="p-4 text-sm text-red-700">{err}</div>
          ) : view.length === 0 ? (
            <div className="p-6 text-center text-slate-600">Không có transport phù hợp.</div>
          ) : (
            <ul className="divide-y">
              {view.map((t) => {
                const list = tripByTransport.get(t.id) ?? [];
                const expanded = expandedId === t.id;
                const icon = /air/i.test(t.transportType)
                  ? '✈️'
                  : /train/i.test(t.transportType)
                    ? '🚆'
                    : /bus/i.test(t.transportType)
                      ? '🚌'
                      : '🚗';

                return (
                  <li key={t.id} className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{icon}</span>
                          <h3 className="truncate text-lg font-bold text-slate-900">{t.name}</h3>
                        </div>
                        <div className="mt-0.5 text-sm text-slate-600">
                          Loại: <b>{t.transportType}</b> • Tạo: {fmtDate(t.dateCreated)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-sky-600/10 px-2.5 py-1 text-xs font-semibold text-sky-800">
                          {list.length} trip
                        </span>
                        <button
                          onClick={() => (expanded ? setExpandedId(null) : setExpandedId(t.id))}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {expanded ? 'Ẩn chuyến' : 'Xem chuyến'}
                        </button>
                        <a
                          href={`/staff/transport/${t.id}/trip/new`}
                          className="rounded-xl bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:brightness-105"
                        >
                          + Tạo trip
                        </a>
                      </div>
                    </div>

                    {/* Expanded trips */}
                    {expanded && (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100">
                        {list.length === 0 ? (
                          <div className="p-3 text-sm text-slate-600">
                            Chưa có trip cho transport này.
                          </div>
                        ) : (
                          <table className="min-w-full text-sm">
                            <thead className="bg-sky-50/70 text-sky-900">
                              <tr>
                                <th className="px-3 py-2 text-left">Điểm đi</th>
                                <th className="px-3 py-2 text-left">Điểm đến</th>
                                <th className="px-3 py-2 text-center">Khởi hành</th>
                                <th className="px-3 py-2 text-center">Đến</th>
                                <th className="px-3 py-2 text-right">Giá</th>
                                <th className="px-3 py-2 text-right">Chỗ</th>
                                <th className="px-3 py-2 text-right">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {list.map((tr) => (
                                <tr key={tr.id} className="border-t">
                                  <td className="px-3 py-2">{tr.departure}</td>
                                  <td className="px-3 py-2">{tr.destination}</td>
                                  <td className="px-3 py-2 text-center">
                                    {fmtDate(tr.departureTime)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {fmtDate(tr.arrivalTime)}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {new Intl.NumberFormat('en-US').format(tr.price)}
                                  </td>
                                  <td className="px-3 py-2 text-right">{tr.availableSeats}</td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      onClick={() => openEdit(tr)}
                                      className="rounded-lg border px-2 py-1 hover:bg-slate-50"
                                    >
                                      Sửa
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ================== Edit Modal ================== */}
      {editOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && closeEdit()} />
          {/* Dialog */}
          <div className="relative z-10 w-[min(680px,92vw)] rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-bold">Cập nhật TransportTrip</div>
              <button
                onClick={() => !saving && closeEdit()}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                disabled={saving}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-600">Transport</label>
                <select
                  value={editForm.transportId}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, transportId: e.target.value } : f))
                  }
                  className="h-11 w-full rounded-xl border px-3"
                  disabled={saving}
                >
                  <option value="">— Chọn —</option>
                  {rows
                    .slice()
                    .sort(
                      (a, b) =>
                        rankType(a.transportType) - rankType(b.transportType) ||
                        a.name.localeCompare(b.name)
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.transportType})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">Điểm đi</label>
                <input
                  value={editForm.departure}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, departure: e.target.value } : f))
                  }
                  className="h-11 w-full rounded-xl border px-3"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Điểm đến</label>
                <input
                  value={editForm.destination}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, destination: e.target.value } : f))
                  }
                  className="h-11 w-full rounded-xl border px-3"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">Khởi hành</label>
                <input
                  type="datetime-local"
                  value={editForm.departureTime}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, departureTime: e.target.value } : f))
                  }
                  className="h-11 w-full rounded-xl border px-3"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Đến</label>
                <input
                  type="datetime-local"
                  value={editForm.arrivalTime}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, arrivalTime: e.target.value } : f))
                  }
                  className="h-11 w-full rounded-xl border px-3"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-600">Giá</label>
                <input
                  inputMode="decimal"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, price: e.target.value } : f))}
                  className="h-11 w-full rounded-xl border px-3"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Số chỗ</label>
                <input
                  inputMode="numeric"
                  value={editForm.availableSeats}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, availableSeats: e.target.value } : f))
                  }
                  className="h-11 w-full rounded-xl border px-3"
                  disabled={saving}
                />
              </div>
            </div>

            {saveErr && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {saveErr}
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={closeEdit}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={submitEdit}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-70"
                disabled={saving}
              >
                {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
