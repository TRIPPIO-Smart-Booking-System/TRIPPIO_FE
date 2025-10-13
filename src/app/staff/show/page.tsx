// src/app/staff/show/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ApiShow,
  UpdateShowDto,
  apiListShows,
  apiUpdateShow,
  apiDeleteShow,
} from '@/data/show.api';

/* ============ Helpers ============ */
type Filters = { city: string; q: string };

function toLocal(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

function currencyVND(n: number) {
  try {
    return new Intl.NumberFormat('vi-VN').format(n);
  } catch {
    return String(n);
  }
}

/* ============ Page ============ */
export default function StaffShowsPage() {
  const [rows, setRows] = useState<ApiShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({ city: '', q: '' });

  // Edit modal
  const [editing, setEditing] = useState<ApiShow | null>(null);
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiListShows();
      setRows(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Load failed';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cities = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((x) => x.city && s.add(x.city));
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [rows]);

  const view = useMemo(() => {
    const { city, q } = filters;
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => !city || r.city === city)
      .filter((r) => {
        if (!qq) return true;
        return (
          r.name.toLowerCase().includes(qq) ||
          r.location.toLowerCase().includes(qq) ||
          r.city.toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
  }, [rows, filters]);

  async function onDelete(row: ApiShow) {
    if (!confirm(`Xoá show "${row.name}"?`)) return;
    try {
      await apiDeleteShow(row.id);
      setRows((list) => list.filter((x) => x.id !== row.id));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      alert(msg);
    }
  }

  async function onSaveEdit(payload: UpdateShowDto) {
    if (!editing) return;
    setSaving(true);
    setOkMsg(null);
    try {
      const updated = await apiUpdateShow(editing.id, payload);
      setRows((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      setOkMsg('Cập nhật thành công!');
      setTimeout(() => {
        setEditing(null);
        setOkMsg(null);
      }, 700);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(56,189,248,0.25),transparent_60%),radial-gradient(900px_500px_at_0%_0%,rgba(45,212,191,0.25),transparent_60%),linear-gradient(180deg,#ecfeff_0%,#f0fdfa_100%)]"
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-3xl border border-white/60 bg-white/80 px-5 py-4 shadow backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight text-sky-800">
              🎛️ Quản lý Shows (Staff)
            </h1>
            <p className="mt-0.5 text-sm text-sky-900/80">Xem • Lọc • Sửa • Xoá — nhanh và gọn.</p>
          </div>
          <a
            href="/staff/shown/new" // nếu route của bạn là /staff/show/new thì sửa lại nhé
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-sky-500/20 ring-1 ring-white/20 hover:brightness-105"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 4v16M4 12h16" />
            </svg>
            Tạo show
          </a>
        </div>

        {/* Toolbar */}
        <div className="mb-5 rounded-3xl bg-white/60 p-[2px] shadow-xl backdrop-blur">
          <div className="rounded-[22px] bg-gradient-to-r from-sky-300/40 via-cyan-300/40 to-teal-300/40 p-3">
            <div className="grid gap-3 rounded-[18px] border border-white/60 bg-white/80 p-3 md:grid-cols-[220px_1fr_auto]">
              <div>
                <div className="mb-1 text-xs text-sky-900/70">Tỉnh/Thành</div>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <option value="">Tất cả</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 text-xs text-sky-900/70">Tìm kiếm</div>
                <div className="relative">
                  <input
                    placeholder="Tên, địa điểm, tỉnh thành…"
                    value={filters.q}
                    onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-10 outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 my-auto text-sky-600/70">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 21l-4.3-4.3" />
                      <circle cx="11" cy="11" r="7" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 p-[2px]">
                  <div className="flex h-11 items-center justify-center rounded-[10px] bg-white/90 text-sm font-semibold text-sky-700">
                    {view.length} kết quả
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur">
          {loading ? (
            <div className="space-y-2 p-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : err ? (
            <div className="p-6 text-sm font-medium text-red-700">{err}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gradient-to-r from-sky-50/90 to-cyan-50/90 text-sky-900 backdrop-blur">
                  <tr className="[&>th]:px-4 [&>th]:py-3">
                    <th className="text-left">Tên</th>
                    <th className="text-left">Địa điểm</th>
                    <th className="text-center">Bắt đầu</th>
                    <th className="text-center">Kết thúc</th>
                    <th className="text-right">Giá</th>
                    <th className="text-right">Vé</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:nth-child(odd)]:bg-slate-50/40">
                  {view.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-sky-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900">{r.location}</div>
                        <div className="text-xs text-slate-500">{r.city}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-800">
                        {toLocal(r.startDate)}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-800">{toLocal(r.endDate)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {currencyVND(r.price)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-800">{r.availableTickets}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-white px-3 py-1.5 font-semibold text-sky-700 shadow-sm hover:bg-sky-50"
                            onClick={() => setEditing(r)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            Sửa
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700 shadow-sm hover:bg-red-50"
                            onClick={() => onDelete(r)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                            </svg>
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!view.length && (
                    <tr>
                      <td className="px-4 py-10 text-center" colSpan={7}>
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {editing && (
          <EditDialog
            show={editing}
            saving={saving}
            okMsg={okMsg}
            onClose={() => setEditing(null)}
            onSave={onSaveEdit}
          />
        )}
      </div>
    </div>
  );
}

/* ============ Pieces ============ */

function SkeletonRow() {
  return (
    <div className="grid grid-cols-7 gap-3 px-4">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-200/70" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-sky-100 bg-sky-50/50 p-6">
      <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 text-white shadow ring-1 ring-white/60">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 3h18v14H8l-5 5V3Z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-sky-900">Không có show phù hợp</p>
      <p className="mt-1 text-sm text-sky-800/80">
        Thử đổi bộ lọc hoặc{' '}
        <a className="font-semibold text-sky-700 underline" href="/staff/show/new">
          tạo show mới
        </a>
        .
      </p>
    </div>
  );
}

/* ===================== Edit Dialog ===================== */
function EditDialog({
  show,
  saving,
  okMsg,
  onClose,
  onSave,
}: {
  show: ApiShow;
  saving: boolean;
  okMsg: string | null;
  onClose: () => void;
  onSave: (dto: UpdateShowDto) => void;
}) {
  const [name, setName] = useState(show.name);
  const [location, setLocation] = useState(show.location);
  const [city, setCity] = useState(show.city);
  const [startDate, setStartDate] = useState(show.startDate.slice(0, 16));
  const [endDate, setEndDate] = useState(show.endDate.slice(0, 16));
  const [price, setPrice] = useState(String(show.price));
  const [tickets, setTickets] = useState(String(show.availableTickets));

  function toIsoLocal(s: string) {
    const ms = Date.parse(s);
    if (Number.isNaN(ms)) return undefined;
    return new Date(ms).toISOString();
  }

  function submit() {
    const dto: UpdateShowDto = {
      name: name.trim() || undefined,
      location: location.trim() || undefined,
      city: city.trim() || undefined,
      startDate: toIsoLocal(startDate),
      endDate: toIsoLocal(endDate),
      price: Number(price),
      availableTickets: Number(tickets),
    };
    if (!Number.isFinite(dto.price!) || dto.price! < 0) {
      alert('Giá phải là số ≥ 0');
      return;
    }
    if (!Number.isInteger(dto.availableTickets!) || dto.availableTickets! < 0) {
      alert('Số vé phải là số nguyên ≥ 0');
      return;
    }
    onSave(dto);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/60 bg-white/95 p-5 shadow-2xl backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 text-white shadow ring-1 ring-white/50">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </span>
            <h3 className="text-lg font-bold text-sky-800">Sửa show</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-2 py-1 text-slate-600 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-700">Tên show</label>
            <input
              className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Địa điểm</label>
            <input
              className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Tỉnh/Thành</label>
            <input
              className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Bắt đầu</label>
            <input
              type="datetime-local"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Kết thúc</label>
            <input
              type="datetime-local"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Giá (VND)</label>
            <input
              inputMode="decimal"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Số vé</label>
            <input
              inputMode="numeric"
              className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={tickets}
              onChange={(e) => setTickets(e.target.value)}
            />
          </div>
        </div>

        {okMsg && (
          <div className="mt-3 rounded-xl border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {okMsg}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 font-semibold text-white shadow hover:brightness-105 disabled:opacity-60"
          >
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
