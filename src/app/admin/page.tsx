'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  RefreshCw,
  Search,
  Receipt,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Route,
  Hotel,
  TicketPercent,
  PieChart as PieIcon,
  BarChart3,
  LineChart,
  LogOut,
  Star,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  PaymentRecord,
  PaymentStatus,
  loadLocalHistory as loadLocalPayments,
  fmtVND as fmtVND_Pay,
} from '@/lib/payment';

import type { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

/* ---------- small helpers ---------- */
const fmtVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

function badgePayment(status: PaymentStatus) {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    case 'Refunded':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
    case 'Failed':
    case 'Expired':
    default:
      return 'bg-red-50 text-red-700 ring-1 ring-red-200';
  }
}
function iconPayment(status: PaymentStatus) {
  switch (status) {
    case 'Paid':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'Pending':
      return <Clock className="h-4 w-4" />;
    case 'Refunded':
      return <RotateCcw className="h-4 w-4" />;
    default:
      return <XCircle className="h-4 w-4" />;
  }
}
function getToken(): string | null {
  try {
    // Ưu tiên authToken, fallback accessToken
    return localStorage.getItem('authToken') ?? localStorage.getItem('accessToken');
  } catch {
    return null;
  }
}

/* ---------- BE types ---------- */
type ApiPaymentAll = {
  code: number;
  message: string;
  data: {
    id: string;
    userId: string;
    orderId: number;
    bookingId: string | null;
    amount: number;
    paymentMethod: string;
    paidAt: string;
    status: PaymentStatus;
    paymentLinkId: string;
    orderCode: number;
  }[];
};

type ApiShow = {
  id: string;
  name: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number;
  availableTickets: number;
  dateCreated: string;
  modifiedDate: string | null;
};

type ApiTransportTrip = {
  id: string;
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  dateCreated: string;
  modifiedDate: string | null;
  transportName: string;
  transportType: string; // Airline | Train | Bus...
};

type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  availableRooms: number;
  dateCreated: string;
  modifiedDate: string | null;
};

/* ---------- Reviews (local) ---------- */
const LS_REVIEWS = 'TRIPPIO_ORDER_REVIEWS';
type LocalReview = {
  id: string;
  orderId: number; // lưu theo orderCode/orderId
  rating: number; // 1..5
  comment?: string;
};
function loadLocalReviews(): LocalReview[] {
  try {
    const raw = localStorage.getItem(LS_REVIEWS);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, LocalReview>;
    return Object.values(map || {});
  } catch {
    return [];
  }
}

/* ---------- utils: typed entries + CSV ---------- */
function typedEntries<T extends Record<string, unknown>>(obj: T) {
  return Object.entries(obj) as { [K in keyof T]: [K, T[K]] }[keyof T][];
}

function toCSV<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]) as Array<keyof T>;
  const lines = rows.map((r) =>
    headers
      .map((h) => {
        const v = r[h];
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      })
      .join(',')
  );
  return [(headers as string[]).join(','), ...lines].join('\n');
}

function downloadCSV<T extends Record<string, unknown>>(filename: string, rows: T[]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Page ---------- */
export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'overview' | 'payments' | 'services' | 'reviews'>('overview');

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // services
  const [shows, setShows] = useState<ApiShow[]>([]);
  const [trips, setTrips] = useState<ApiTransportTrip[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);

  // users from /api/payment/all
  const [usersFromPayments, setUsersFromPayments] = useState(0);

  // reviews (local) + mapping với payments
  const [reviews, setReviews] = useState<LocalReview[]>([]);

  // filters
  const [qPays, setQPays] = useState('');
  const [payStatus, setPayStatus] = useState<'ALL' | PaymentStatus>('ALL');

  const [qReviews, setQReviews] = useState('');
  const [reviewStars, setReviewStars] = useState<'ALL' | 1 | 2 | 3 | 4 | 5>('ALL');

  // paging
  const [pagePays, setPagePays] = useState(1);
  const [pageReviews, setPageReviews] = useState(1);
  const pageSize = 10;

  // auto refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const lastUpdatedRef = useRef<Date | null>(null);

  const router = useRouter();
  function logout() {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
    } catch {}
    router.replace('/login');
  }

  async function loadAll() {
    try {
      setLoading(true);
      setErr(null);

      /* ---------- Payments: nguồn KPI ---------- */
      let paysOut: PaymentRecord[] = [];
      try {
        const r = await fetch(`${API_BASE}/api/payment/all`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
          cache: 'no-store',
        });

        if (r.ok) {
          const raw = (await r.json()) as ApiPaymentAll;
          const list = Array.isArray(raw?.data) ? raw.data : [];

          const userSet = new Set<string>();
          list.forEach((p) => p.userId && userSet.add(p.userId));
          setUsersFromPayments(userSet.size);

          paysOut = list
            .map((p) => ({
              id: p.id,
              orderId: String(p.orderCode ?? p.orderId ?? ''),
              amountVND: Number(p.amount ?? 0),
              method: p.paymentMethod || 'PayOS',
              status: p.status,
              createdAt: p.paidAt ?? new Date().toISOString(),
              updatedAt: p.paidAt ?? undefined,
              note: p.bookingId ? `Booking: ${p.bookingId}` : undefined,
            }))
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        } else {
          paysOut = loadLocalPayments();
          setUsersFromPayments(0);
        }
      } catch {
        paysOut = loadLocalPayments();
        setUsersFromPayments(0);
      }

      /* ---------- Services ---------- */
      let showsOut: ApiShow[] = [];
      try {
        const r = await fetch(`${API_BASE}/api/Show`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
          cache: 'no-store',
        });
        if (r.ok) showsOut = (await r.json()) as ApiShow[];
      } catch {
        showsOut = [];
      }

      let tripsOut: ApiTransportTrip[] = [];
      try {
        const r = await fetch(`${API_BASE}/api/TransportTrip`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
          cache: 'no-store',
        });
        if (r.ok) tripsOut = (await r.json()) as ApiTransportTrip[];
      } catch {
        tripsOut = [];
      }

      let roomsOut: ApiRoom[] = [];
      try {
        const r = await fetch(`${API_BASE}/api/Room`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
          cache: 'no-store',
        });
        if (r.ok) roomsOut = (await r.json()) as ApiRoom[];
      } catch {
        roomsOut = [];
      }

      // Reviews local
      const reviewsLocal = loadLocalReviews();

      setPayments(paysOut);
      setShows(showsOut);
      setTrips(tripsOut);
      setRooms(roomsOut);
      setReviews(reviewsLocal);

      lastUpdatedRef.current = new Date();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load failed');
      setPayments(loadLocalPayments());
      setShows([]);
      setTrips([]);
      setRooms([]);
      setUsersFromPayments(0);
      setReviews(loadLocalReviews());
      lastUpdatedRef.current = new Date();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const reload = () => loadAll();
    window.addEventListener('payments:changed', reload);
    window.addEventListener('reviews:changed', reload);
    return () => {
      window.removeEventListener('payments:changed', reload);
      window.removeEventListener('reviews:changed', reload);
    };
  }, []);

  // auto refresh mỗi 5s khi bật
  useEffect(() => {
    if (!autoRefresh) return;
    const itv = setInterval(() => {
      loadAll();
    }, 5000);
    return () => clearInterval(itv);
  }, [autoRefresh]);

  /* ---------- KPI (chỉ từ payments) ---------- */
  const paidPays = useMemo(() => payments.filter((p) => p.status === 'Paid'), [payments]);

  const kpiDisplay = useMemo(() => {
    const revenue = paidPays.reduce((s, p) => s + (p.amountVND || 0), 0);
    const ordersUnique = new Set(payments.map((p) => p.orderId)).size;
    const paidOrdersUnique = new Set(paidPays.map((p) => p.orderId)).size;
    const users = usersFromPayments;
    // thay vì conversion, ta hiển thị số review
    const reviewCount = reviews.length;
    return { revenue, orders: ordersUnique, paidOrders: paidOrdersUnique, users, reviewCount };
  }, [payments, paidPays, usersFromPayments, reviews]);

  // sparkline doanh thu theo ngày (Paid)
  const revenueDaily = useMemo(() => {
    const map: Record<string, number> = {};
    paidPays.forEach((p) => {
      const day = (p.createdAt || '').slice(0, 10);
      if (!day) return;
      map[day] = (map[day] ?? 0) + (p.amountVND || 0);
    });
    const ent = typedEntries(map).sort((a, b) => (a[0] < b[0] ? -1 : 1));
    return {
      categories: ent.map((e) => e[0] as string),
      series: ent.map((e) => Number(e[1])),
    };
  }, [paidPays]);

  /* ---------- Charts data (từ API thật) ---------- */
  const potentialShows = shows.reduce((s, v) => s + (v.price || 0) * (v.availableTickets || 0), 0);
  const potentialTrips = trips.reduce((s, v) => s + (v.price || 0) * (v.availableSeats || 0), 0);
  const potentialRooms = rooms.reduce(
    (s, v) => s + (v.pricePerNight || 0) * (v.availableRooms || 0),
    0
  );
  const donutLabels = ['Shows (Potential)', 'Transport Trips (Potential)', 'Rooms (Potential)'];
  const donutSeries = [potentialShows, potentialTrips, potentialRooms];

  const barAgg = useMemo(() => {
    const map: Record<string, number> = {};
    shows.forEach((s) => {
      map[s.city] = (map[s.city] ?? 0) + (s.availableTickets || 0);
    });
    const ent = typedEntries(map)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 6);
    return { categories: ent.map((e) => e[0] as string), series: ent.map((e) => Number(e[1])) };
  }, [shows]);

  const methodAgg = useMemo(() => {
    const map: Record<string, number> = {};
    paidPays.forEach((p) => {
      const k = p.method || 'Unknown';
      map[k] = (map[k] ?? 0) + (p.amountVND || 0);
    });
    const ent = typedEntries(map);
    return { labels: ent.map((e) => e[0] as string), series: ent.map((e) => Number(e[1])) };
  }, [paidPays]);

  /* ---------- Filters + paging ---------- */
  const filteredPays = useMemo(() => {
    return payments
      .filter((r) => (payStatus === 'ALL' ? true : r.status === payStatus))
      .filter(
        (r) =>
          !qPays ||
          r.id.toLowerCase().includes(qPays.toLowerCase()) ||
          r.orderId.toLowerCase().includes(qPays.toLowerCase())
      );
  }, [payments, payStatus, qPays]);

  // Reviews only show entries that can be joined with a payment (prefer Paid); if missing, still show
  const paymentByOrder = useMemo(() => {
    const map = new Map<string, PaymentRecord>();
    payments.forEach((p) => {
      const key = (p.orderId || '').trim();
      if (!key) return;
      // ưu tiên Paid
      const existed = map.get(key);
      if (!existed || existed.status !== 'Paid') map.set(key, p);
      if (p.status === 'Paid') map.set(key, p);
    });
    return map;
  }, [payments]);

  const reviewsJoined = useMemo(() => {
    return reviews
      .map((rv) => {
        const p = paymentByOrder.get(String(rv.orderId));
        return {
          orderId: rv.orderId,
          rating: rv.rating,
          comment: rv.comment || '',
          paymentId: p?.id || '',
          status: p?.status || ('Unknown' as PaymentStatus),
          amountVND: p?.amountVND ?? 0,
          paidAt: p?.createdAt || '',
          method: p?.method || '',
        };
      })
      .filter((row) => (reviewStars === 'ALL' ? true : Number(row.rating) === Number(reviewStars)))
      .filter((row) =>
        !qReviews
          ? true
          : String(row.orderId).toLowerCase().includes(qReviews.toLowerCase()) ||
            row.paymentId.toLowerCase().includes(qReviews.toLowerCase()) ||
            row.comment.toLowerCase().includes(qReviews.toLowerCase())
      )
      .sort((a, b) => {
        // sort theo paidAt nếu có, fallback orderId
        const ta = a.paidAt ? +new Date(a.paidAt) : 0;
        const tb = b.paidAt ? +new Date(b.paidAt) : 0;
        return tb - ta || String(b.orderId).localeCompare(String(a.orderId));
      });
  }, [reviews, paymentByOrder, qReviews, reviewStars]);

  const pageCountPays = Math.max(1, Math.ceil(filteredPays.length / pageSize));
  const pageCountReviews = Math.max(1, Math.ceil(reviewsJoined.length / pageSize));

  const pagePaysRows = filteredPays.slice((pagePays - 1) * pageSize, pagePays * pageSize);
  const pageReviewsRows = reviewsJoined.slice((pageReviews - 1) * pageSize, pageReviews * pageSize);

  /* ---------- Chart options ---------- */
  const sparkOptions: ApexOptions = {
    chart: { sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 2 },
    tooltip: {
      y: { formatter: (val) => fmtVND(Number(val)) },
      x: { show: true, formatter: (val) => String(val) },
    },
  };
  const revenueAreaOptions: ApexOptions = {
    chart: { toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 3 },
    xaxis: { categories: revenueDaily.categories },
    tooltip: { y: { formatter: (val) => fmtVND(Number(val)) } },
  };
  const donutMethodOptions: ApexOptions = {
    labels: methodAgg.labels,
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => fmtVND(Number(v)) } },
  };
  const donutPotentialOptions: ApexOptions = {
    labels: donutLabels,
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => fmtVND(Number(val)) } },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold inline-flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-sky-600" /> Admin Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              autoRefresh ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:bg-slate-50'
            }`}
            title="Auto refresh mỗi 5 giây"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto
          </button>
          <button
            onClick={loadAll}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      {/* Last updated */}
      <div className="mt-2 text-xs text-slate-500">
        {lastUpdatedRef.current ? (
          <>Cập nhật lần cuối: {lastUpdatedRef.current.toLocaleString('vi-VN')}</>
        ) : (
          <>Đang tải dữ liệu…</>
        )}
      </div>

      {/* KPI cards */}
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          label="Doanh thu (VND)"
          value={fmtVND(kpiDisplay.revenue)}
          extra={
            <div className="mt-2">
              <Chart
                type="line"
                height={60}
                series={[{ name: 'Revenue', data: revenueDaily.series }]}
                options={{ ...sparkOptions, xaxis: { categories: revenueDaily.categories } }}
              />
            </div>
          }
        />
        <KpiCard
          icon={<Receipt className="h-5 w-5 text-sky-600" />}
          label="Tổng đơn hàng"
          value={String(kpiDisplay.orders)}
        />
        <KpiCard
          icon={<Star className="h-5 w-5 text-amber-500" />}
          label="Tổng số review"
          value={String(kpiDisplay.reviewCount)}
        />
        <KpiCard
          icon={<Users className="h-5 w-5 text-violet-600" />}
          label="Người dùng (ước tính)"
          value={String(kpiDisplay.users)}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <TabBtn active={tab === 'overview'} onClick={() => setTab('overview')}>
          Overview
        </TabBtn>
        <TabBtn active={tab === 'payments'} onClick={() => setTab('payments')}>
          Payments
        </TabBtn>
        <TabBtn active={tab === 'services'} onClick={() => setTab('services')}>
          Services
        </TabBtn>
        <TabBtn active={tab === 'reviews'} onClick={() => setTab('reviews')}>
          Reviews
        </TabBtn>
      </div>

      {/* Content */}
      <div className="mt-4">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Donut Potential */}
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Potential Revenue by Category</div>
                <PieIcon className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-2">
                <Chart
                  type="donut"
                  height={300}
                  series={donutSeries}
                  options={donutPotentialOptions}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 text-sm">
                <div>
                  <div className="text-slate-500">Shows</div>
                  <div className="font-semibold">{fmtVND(potentialShows)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Trips</div>
                  <div className="font-semibold">{fmtVND(potentialTrips)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Rooms</div>
                  <div className="font-semibold">{fmtVND(potentialRooms)}</div>
                </div>
              </div>
            </div>

            {/* Bar */}
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Show Tickets Available by City</div>
                <BarChart3 className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-2">
                <Chart
                  type="bar"
                  height={300}
                  series={[{ name: 'Tickets', data: barAgg.series }]}
                  options={{
                    xaxis: { categories: barAgg.categories },
                    dataLabels: { enabled: false },
                    plotOptions: { bar: { borderRadius: 6 } },
                    grid: { borderColor: '#e5e7eb', strokeDashArray: 3 },
                  }}
                />
              </div>
            </div>

            {/* Revenue by Method */}
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Revenue by Payment Method</div>
                <PieIcon className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-2">
                <Chart
                  type="donut"
                  height={300}
                  series={methodAgg.series}
                  options={donutMethodOptions}
                />
              </div>
            </div>

            {/* Daily Paid Revenue */}
            <div className="rounded-2xl border bg-white p-4 xl:col-span-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Daily Paid Revenue</div>
                <LineChart className="h-5 w-5 text-slate-500" />
              </div>
              <div className="mt-2">
                <Chart
                  type="area"
                  height={320}
                  series={[{ name: 'Revenue', data: revenueDaily.series }]}
                  options={revenueAreaOptions}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <>
            {/* Filters Payments */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border bg-white px-3">
                <Search className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  value={qPays}
                  onChange={(e) => {
                    setPagePays(1);
                    setQPays(e.target.value);
                  }}
                  placeholder="Tìm theo mã thanh toán / mã đơn…"
                  className="h-10 w-full outline-none"
                />
              </div>
              <select
                value={payStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setPagePays(1);
                  setPayStatus(e.target.value as 'ALL' | PaymentStatus);
                }}
                className="h-10 rounded-xl border bg-white px-3"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
                <option value="Expired">Expired</option>
              </select>
              <button
                onClick={() => downloadCSV('payments.csv', filteredPays)}
                className="h-10 rounded-xl border bg-white px-3 text-sm hover:bg-slate-50 inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white">
              <div className="grid grid-cols-[160px,1fr,160px,160px,160px] gap-3 border-b bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <div>Mã thanh toán</div>
                <div>Mã đơn</div>
                <div>Số tiền</div>
                <div>Trạng thái</div>
                <div>Thời gian</div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-slate-600">
                  <RefreshCw className="h-5 w-5 animate-spin" /> Đang tải…
                </div>
              ) : pagePaysRows.length ? (
                pagePaysRows.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[160px,1fr,160px,160px,160px] items-center gap-3 border-b px-4 py-3 text-sm last:border-0"
                  >
                    <div className="font-mono text-[12px]">{p.id}</div>
                    <div className="font-mono text-[12px]">{p.orderId}</div>
                    <div className="font-semibold">{fmtVND_Pay(p.amountVND)}</div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${badgePayment(
                          p.status
                        )}`}
                      >
                        {iconPayment(p.status)}
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-600">
                      {new Date(p.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-600">Không có thanh toán nào.</div>
              )}
            </div>

            {pageCountPays > 1 && (
              <Pager
                page={pagePays}
                pageCount={pageCountPays}
                onPrev={() => setPagePays((p) => Math.max(1, p - 1))}
                onNext={() => setPagePays((p) => Math.min(pageCountPays, p + 1))}
              />
            )}
          </>
        )}

        {tab === 'services' && (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {/* Shows */}
            <div className="rounded-2xl border bg-white">
              <HeaderBlock
                icon={<TicketPercent className="h-5 w-5" />}
                title="Shows"
                onExport={() => downloadCSV('shows.csv', shows)}
              />
              <div className="grid grid-cols-[160px,1fr,160px,120px,160px] gap-3 border-b bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <div>Mã</div>
                <div>Tên & Địa điểm</div>
                <div>Thời gian</div>
                <div>Vé còn</div>
                <div>Giá</div>
              </div>
              {shows.length ? (
                shows.map((s) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-[160px,1fr,160px,120px,160px] items-center gap-3 border-b px-4 py-2 text-sm last:border-0"
                  >
                    <div className="font-mono text-[12px]">{s.id}</div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[12px] text-slate-600">{s.location}</div>
                      <div className="text-[12px] text-slate-600">{s.city}</div>
                    </div>
                    <div className="text-[12px] text-slate-600">
                      {new Date(s.startDate).toLocaleString('vi-VN')} –{' '}
                      {new Date(s.endDate).toLocaleString('vi-VN')}
                    </div>
                    <div>{s.availableTickets}</div>
                    <div className="font-semibold">{fmtVND(s.price)}</div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500">Không có dữ liệu.</div>
              )}
            </div>

            {/* Transport Trips */}
            <div className="rounded-2xl border bg-white">
              <HeaderBlock
                icon={<Route className="h-5 w-5" />}
                title="Transport Trips"
                onExport={() => downloadCSV('transport_trips.csv', trips)}
              />
              <div className="grid grid-cols-[160px,1fr,200px,120px,120px] gap-3 border-b bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <div>Mã</div>
                <div>Tuyến & Hãng</div>
                <div>Thời gian</div>
                <div>Ghế còn</div>
                <div>Giá</div>
              </div>
              {trips.length ? (
                trips.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-[160px,1fr,200px,120px,120px] items-center gap-3 border-b px-4 py-2 text-sm last:border-0"
                  >
                    <div className="font-mono text-[12px]">{t.id}</div>
                    <div>
                      <div className="font-medium">
                        {t.departure} → {t.destination}
                      </div>
                      <div className="text-[12px] text-slate-600">
                        {t.transportName} • {t.transportType}
                      </div>
                    </div>
                    <div className="text-[12px] text-slate-600">
                      {new Date(t.departureTime).toLocaleString('vi-VN')} –{' '}
                      {new Date(t.arrivalTime).toLocaleString('vi-VN')}
                    </div>
                    <div>{t.availableSeats}</div>
                    <div className="font-semibold">{fmtVND(t.price)}</div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500">Không có dữ liệu.</div>
              )}
            </div>

            {/* Rooms */}
            <div className="rounded-2xl border bg-white 2xl:col-span-2">
              <HeaderBlock
                icon={<Hotel className="h-5 w-5" />}
                title="Rooms"
                onExport={() => downloadCSV('rooms.csv', rooms)}
              />
              <div className="grid grid-cols-[160px,1fr,160px,140px,140px] gap-3 border-b bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <div>Mã</div>
                <div>Hạng phòng</div>
                <div>Sức chứa</div>
                <div>Phòng còn</div>
                <div>Giá/đêm</div>
              </div>
              {rooms.length ? (
                rooms.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[160px,1fr,160px,140px,140px] items-center gap-3 border-b px-4 py-2 text-sm last:border-0"
                  >
                    <div className="font-mono text-[12px]">{r.id}</div>
                    <div>{r.roomType}</div>
                    <div>{r.capacity}</div>
                    <div>{r.availableRooms}</div>
                    <div className="font-semibold">{fmtVND(r.pricePerNight)}</div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500">Không có dữ liệu.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <>
            {/* Filters Reviews */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border bg-white px-3">
                <Search className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  value={qReviews}
                  onChange={(e) => {
                    setPageReviews(1);
                    setQReviews(e.target.value);
                  }}
                  placeholder="Tìm theo order code / payment id / nội dung…"
                  className="h-10 w-full outline-none"
                />
              </div>
              <select
                value={String(reviewStars)}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setPageReviews(1);
                  const v =
                    e.target.value === 'ALL'
                      ? 'ALL'
                      : (Number(e.target.value) as 1 | 2 | 3 | 4 | 5);
                  setReviewStars(v);
                }}
                className="h-10 rounded-xl border bg-white px-3"
              >
                <option value="ALL">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
              <button
                onClick={() => downloadCSV('reviews.csv', reviewsJoined)}
                className="h-10 rounded-xl border bg-white px-3 text-sm hover:bg-slate-50 inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-white">
              <div className="grid grid-cols-[140px,140px,1fr,120px,160px,120px] gap-3 border-b bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <div>Order Code</div>
                <div>Payment ID</div>
                <div>Review</div>
                <div>Điểm</div>
                <div>Số tiền</div>
                <div>Thời gian</div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-slate-600">
                  <RefreshCw className="h-5 w-5 animate-spin" /> Đang tải…
                </div>
              ) : pageReviewsRows.length ? (
                pageReviewsRows.map((row) => (
                  <div
                    key={`${row.orderId}-${row.paymentId}`}
                    className="grid grid-cols-[140px,140px,1fr,120px,160px,120px] items-center gap-3 border-b px-4 py-3 text-sm last:border-0"
                  >
                    <div className="font-mono text-[12px]">{row.orderId}</div>
                    <div className="font-mono text-[12px]">{row.paymentId || '—'}</div>
                    <div className="text-slate-700">
                      {row.comment || <span className="text-slate-400">—</span>}
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <StarRow value={row.rating} />
                      <span className="text-xs text-slate-500 ml-1">{row.rating}/5</span>
                    </div>
                    <div className="font-semibold">{fmtVND(row.amountVND)}</div>
                    <div className="text-[12px] text-slate-600">
                      {row.paidAt ? new Date(row.paidAt).toLocaleString('vi-VN') : '—'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-600">
                  Chưa có review nào. (Lưu ý: review đang lưu local theo trình duyệt)
                </div>
              )}
            </div>

            {pageCountReviews > 1 && (
              <Pager
                page={pageReviews}
                pageCount={pageCountReviews}
                onPrev={() => setPageReviews((p) => Math.max(1, p - 1))}
                onNext={() => setPageReviews((p) => Math.min(pageCountReviews, p + 1))}
              />
            )}
          </>
        )}
      </div>

      {err && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{err}</div>
      )}
    </div>
  );
}

/* ---------- Bits ---------- */
function KpiCard({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">{label}</div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {extra}
    </div>
  );
}
function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-medium ${
        active ? 'bg-sky-600 text-white' : 'border bg-white hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}
function Pager({
  page,
  pageCount,
  onPrev,
  onNext,
}: {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button onClick={onPrev} className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50">
        Trước
      </button>
      <div className="text-sm">
        Trang {page}/{pageCount}
      </div>
      <button onClick={onNext} className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-50">
        Sau
      </button>
    </div>
  );
}
function HeaderBlock({
  icon,
  title,
  onExport,
}: {
  icon: React.ReactNode;
  title: string;
  onExport?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="inline-flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="text-xs rounded-lg border px-2 py-1 hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
      </div>
    </div>
  );
}
function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}
