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
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatVietnamDate, formatVietnamTime, formatVietnamDateTime } from '@/lib/timezone';

import {
  PaymentRecord,
  PaymentStatus,
  loadLocalHistory as loadLocalPayments,
  fmtVND as fmtVND_Pay,
} from '@/lib/payment';
import { showSuccess, showError } from '@/lib/toast';
import { apiAdminAssignRoles } from '@/lib/api';

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

type ApiUser = {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  fullName: string;
  lastLoginDate: string | null;
  dateCreated: string;
  roles: string[];
};

/* ---------- Reviews (local) ---------- */
const LS_REVIEWS = 'TRIPPIO_ORDER_REVIEWS';
type LocalReview = {
  id: string;
  orderId: number; // lưu theo orderCode/orderId
  rating: number; // 1..5
  comment?: string;
  userName?: string;
  createdAt?: string;
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
  const [tab, setTab] = useState<
    'overview' | 'payments' | 'services' | 'reviews' | 'users' | 'assign-roles'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // services
  const [shows, setShows] = useState<ApiShow[]>([]);
  const [trips, setTrips] = useState<ApiTransportTrip[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);

  // users
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersPageIndex, setUsersPageIndex] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(10);
  const [usersRowCount, setUsersRowCount] = useState(0);
  const [qUsers, setQUsers] = useState('');

  // users from /api/payment/all
  const [usersFromPayments, setUsersFromPayments] = useState(0);

  // reviews (local) + mapping với payments
  const [reviews, setReviews] = useState<LocalReview[]>([]);

  // role management
  const [editingUserRole, setEditingUserRole] = useState<string | null>(null);
  const [editingUserRoles, setEditingUserRoles] = useState<string[]>([]);
  const [savingRole, setSavingRole] = useState(false);

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

  async function onEditUserRole(userId: string, currentRoles: string[]) {
    setEditingUserRole(userId);
    setEditingUserRoles([...currentRoles]);
  }

  async function onSaveUserRole() {
    if (!editingUserRole) return;
    setSavingRole(true);
    try {
      await apiAdminAssignRoles(editingUserRole, editingUserRoles);
      // Update user in the list
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUserRole ? { ...u, roles: editingUserRoles } : u))
      );
      showSuccess(`Cập nhật role cho user thành công!`);
      setEditingUserRole(null);
      setEditingUserRoles([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật role';
      showError(`Lỗi: ${msg}`);
    } finally {
      setSavingRole(false);
    }
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

      // Reviews: gọi real API thay vì mock
      let reviewsOut: LocalReview[] = [];
      try {
        const r = await fetch(`${API_BASE}/api/review`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
          cache: 'no-store',
        });
        if (r.ok) {
          const raw = (await r.json()) as {
            data?: Array<{
              id: number;
              orderId: number;
              rating: number;
              comment?: string;
              userName?: string;
              createdAt?: string;
            }>;
          };
          reviewsOut = (raw.data || []).map((rv) => ({
            id: String(rv.id),
            orderId: rv.orderId,
            rating: rv.rating,
            comment: rv.comment,
            userName: rv.userName,
            createdAt: rv.createdAt,
          }));
        } else {
          reviewsOut = loadLocalReviews();
        }
      } catch {
        reviewsOut = loadLocalReviews();
      }

      // Users: gọi API để lấy danh sách user
      let usersOut: ApiUser[] = [];
      let usersCount = 0;
      try {
        const r = await fetch(`${API_BASE}/api/admin/user/paging?pageIndex=1&pageSize=100`, {
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
          cache: 'no-store',
        });
        if (r.ok) {
          const raw = (await r.json()) as { results?: ApiUser[]; rowCount?: number };
          usersOut = raw.results || [];
          usersCount = raw.rowCount || 0;
        }
      } catch {
        usersOut = [];
        usersCount = 0;
      }

      setPayments(paysOut);
      setShows(showsOut);
      setTrips(tripsOut);
      setRooms(roomsOut);
      setReviews(reviewsOut);
      setUsers(usersOut);
      setUsersRowCount(usersCount);

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

  /* ---------- Rating Statistics ---------- */
  const ratingStats = useMemo(() => {
    if (!reviews.length)
      return {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach((rv) => {
      const r = Math.min(5, Math.max(1, Math.round(rv.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[r]++;
      totalRating += rv.rating;
    });

    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      distribution,
    };
  }, [reviews]);

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
          userName: rv.userName || '',
          createdAt: rv.createdAt || '',
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
          label="Tổng người dùng"
          value={String(usersRowCount)}
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
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>
          Users
        </TabBtn>
        <TabBtn active={tab === 'assign-roles'} onClick={() => setTab('assign-roles')}>
          Assign Roles
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
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <div className="flex flex-1 min-w-60 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <Search className="mr-3 h-5 w-5 text-slate-400" />
                <input
                  value={qPays}
                  onChange={(e) => {
                    setPagePays(1);
                    setQPays(e.target.value);
                  }}
                  placeholder="Tìm theo mã thanh toán / mã đơn…"
                  className="h-9 w-full outline-none text-sm"
                />
              </div>
              <select
                value={payStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setPagePays(1);
                  setPayStatus(e.target.value as 'ALL' | PaymentStatus);
                }}
                className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm shadow-sm hover:shadow-md transition-shadow"
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
                className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md inline-flex items-center gap-2 font-medium text-slate-700"
              >
                <Download className="h-4 w-4" /> Export
              </button>
            </div>

            {/* Payments Table */}
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-slate-600">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Đang tải dữ liệu thanh toán…</span>
              </div>
            ) : pagePaysRows.length ? (
              <div className="space-y-3">
                {pagePaysRows.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Payment ID */}
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Mã Thanh Toán
                        </div>
                        <div className="font-mono text-sm font-semibold text-slate-900 break-all">
                          {p.id}
                        </div>
                      </div>

                      {/* Order ID */}
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Mã Đơn
                        </div>
                        <div className="font-mono text-sm font-semibold text-slate-900">
                          {p.orderId}
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Số Tiền
                        </div>
                        <div className="text-lg font-bold text-emerald-600">
                          {fmtVND_Pay(p.amountVND)}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Trạng Thái
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgePayment(p.status)}`}
                        >
                          {iconPayment(p.status)}
                          {p.status === 'Paid' && 'Đã thanh toán'}
                          {p.status === 'Pending' && 'Đang xử lý'}
                          {p.status === 'Failed' && 'Thất bại'}
                          {p.status === 'Refunded' && 'Đã hoàn tiền'}
                          {p.status === 'Expired' && 'Hết hạn'}
                        </span>
                      </div>

                      {/* Time */}
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Thời Gian
                        </div>
                        <div className="text-sm text-slate-700 font-medium">
                          {formatVietnamDateTime(p.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">Không có thanh toán nào.</p>
              </div>
            )}

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
          <div className="space-y-6">
            {/* Shows */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TicketPercent className="h-5 w-5 text-blue-600" />
                    Shows
                  </h3>
                  <button
                    onClick={() => downloadCSV('shows.csv', shows)}
                    className="h-9 rounded-xl border bg-white px-3 text-sm hover:bg-slate-50 inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <Download className="h-4 w-4" /> Export CSV
                  </button>
                </div>
              </div>
              {shows.length ? (
                <div className="space-y-3">
                  {shows.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* ID */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Mã
                          </div>
                          <div className="mt-1 font-mono text-sm font-medium text-slate-900">
                            {s.id}
                          </div>
                        </div>

                        {/* Name & Location */}
                        <div className="md:col-span-2">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Tên & Địa Điểm
                          </div>
                          <div className="mt-1">
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-600 mt-1">
                              📍 {s.location}, {s.city}
                            </div>
                          </div>
                        </div>

                        {/* Time */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Thời Gian
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            {formatVietnamDate(s.startDate)} – {formatVietnamDate(s.endDate)}
                          </div>
                        </div>

                        {/* Tickets & Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Vé Còn
                            </div>
                            <div className="mt-1 text-lg font-bold text-blue-600">
                              {s.availableTickets}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Giá
                            </div>
                            <div className="mt-1 text-lg font-bold text-emerald-600">
                              {fmtVND(s.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center">
                  <TicketPercent className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-600">Không có shows nào</p>
                </div>
              )}
            </div>

            {/* Transport Trips */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Route className="h-5 w-5 text-purple-600" />
                    Transport Trips
                  </h3>
                  <button
                    onClick={() => downloadCSV('transport_trips.csv', trips)}
                    className="h-9 rounded-xl border bg-white px-3 text-sm hover:bg-slate-50 inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <Download className="h-4 w-4" /> Export CSV
                  </button>
                </div>
              </div>
              {trips.length ? (
                <div className="space-y-3">
                  {trips.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* ID */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Mã
                          </div>
                          <div className="mt-1 font-mono text-sm font-medium text-slate-900">
                            {t.id}
                          </div>
                        </div>

                        {/* Route & Transport */}
                        <div className="md:col-span-2">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Tuyến & Hãng
                          </div>
                          <div className="mt-1">
                            <div className="font-semibold text-slate-900">
                              {t.departure} → {t.destination}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              🚌 {t.transportName} • {t.transportType}
                            </div>
                          </div>
                        </div>

                        {/* Time */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Thời Gian
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            {formatVietnamDate(t.departureTime)}
                            <br />
                            {formatVietnamTime(t.departureTime)} –{' '}
                            {formatVietnamTime(t.arrivalTime)}
                          </div>
                        </div>

                        {/* Seats & Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Ghế Còn
                            </div>
                            <div className="mt-1 text-lg font-bold text-blue-600">
                              {t.availableSeats}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Giá
                            </div>
                            <div className="mt-1 text-lg font-bold text-emerald-600">
                              {fmtVND(t.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center">
                  <Route className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-600">Không có trips nào</p>
                </div>
              )}
            </div>

            {/* Rooms */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-orange-600" />
                    Rooms
                  </h3>
                  <button
                    onClick={() => downloadCSV('rooms.csv', rooms)}
                    className="h-9 rounded-xl border bg-white px-3 text-sm hover:bg-slate-50 inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <Download className="h-4 w-4" /> Export CSV
                  </button>
                </div>
              </div>
              {rooms.length ? (
                <div className="space-y-3">
                  {rooms.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* ID */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Mã
                          </div>
                          <div className="mt-1 font-mono text-sm font-medium text-slate-900">
                            {r.id}
                          </div>
                        </div>

                        {/* Room Type */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Hạng Phòng
                          </div>
                          <div className="mt-1 font-semibold text-slate-900">{r.roomType}</div>
                        </div>

                        {/* Capacity */}
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Sức Chứa
                          </div>
                          <div className="mt-1 text-lg font-bold text-blue-600">
                            {r.capacity} người
                          </div>
                        </div>

                        {/* Available & Price */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Phòng Còn
                            </div>
                            <div className="mt-1 text-lg font-bold text-blue-600">
                              {r.availableRooms}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Giá/Đêm
                            </div>
                            <div className="mt-1 text-lg font-bold text-emerald-600">
                              {fmtVND(r.pricePerNight)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center">
                  <Hotel className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-600">Không có rooms nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <>
            {/* Rating Statistics */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-xl border bg-white p-4">
                <div className="text-sm text-slate-600">Tổng đánh giá</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {ratingStats.totalReviews}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <div className="text-sm text-slate-600">Điểm trung bình</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-2xl font-bold text-amber-600">
                    {ratingStats.averageRating}
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(ratingStats.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <div className="text-sm text-slate-600">5 sao</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-2xl font-bold text-emerald-600">
                    {ratingStats.distribution[5]}
                  </div>
                  <div className="text-xs text-slate-500">
                    {ratingStats.totalReviews > 0
                      ? `${Math.round((ratingStats.distribution[5] / ratingStats.totalReviews) * 100)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <div className="text-sm text-slate-600">Phân bố sao</div>
                <div className="mt-2 space-y-1 text-xs">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-4 text-right">{s}:</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{
                            width: `${ratingStats.totalReviews > 0 ? (ratingStats.distribution[s as 1 | 2 | 3 | 4 | 5] / ratingStats.totalReviews) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-5 text-right text-slate-600">
                        {ratingStats.distribution[s as 1 | 2 | 3 | 4 | 5]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-600 bg-white rounded-2xl">
                <RefreshCw className="h-5 w-5 animate-spin" /> Đang tải…
              </div>
            ) : pageReviewsRows.length ? (
              <div className="space-y-3">
                {pageReviewsRows.map((row) => (
                  <div
                    key={`${row.orderId}-${row.paymentId}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    {/* Top Row - Main Info */}
                    <div className="grid grid-cols-12 gap-4">
                      {/* Order Code - 2 cols */}
                      <div className="col-span-12 sm:col-span-2 pb-4 sm:pb-0 sm:border-r sm:border-slate-200">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Order Code
                        </div>
                        <div className="mt-1 font-mono text-sm font-medium text-slate-900">
                          {row.orderId}
                        </div>
                      </div>

                      {/* Payment ID - 2 cols */}
                      <div className="col-span-12 sm:col-span-2 pb-4 sm:pb-0 sm:border-r sm:border-slate-200 sm:pl-4">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Payment ID
                        </div>
                        <div className="mt-1 font-mono text-sm text-slate-600 truncate">
                          {row.paymentId || '—'}
                        </div>
                      </div>

                      {/* Rating - 2 cols */}
                      <div className="col-span-12 sm:col-span-2 pb-4 sm:pb-0 sm:border-r sm:border-slate-200 sm:pl-4">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Điểm
                        </div>
                        <div className="mt-1 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                          <StarRow value={row.rating} />
                          <span className="font-semibold text-blue-900">{row.rating}/5</span>
                        </div>
                      </div>

                      {/* Username - 3 cols */}
                      <div className="col-span-12 sm:col-span-3 pb-4 sm:pb-0 sm:border-r sm:border-slate-200 sm:pl-4">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Người Dùng
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-900 truncate">
                          {row.userName || '—'}
                        </div>
                      </div>

                      {/* Created Date & Time - 3 cols, side by side */}
                      <div className="col-span-12 sm:col-span-3 pb-4 sm:pb-0 sm:pl-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Date */}
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Ngày Tạo
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                              {row.createdAt ? formatVietnamDate(row.createdAt) : '—'}
                            </div>
                          </div>
                          {/* Time */}
                          <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Giờ
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                              {row.createdAt ? formatVietnamTime(row.createdAt) : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    {row.comment && (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          💬 Nhận Xét
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{row.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-600">Chưa có review nào</p>
              </div>
            )}

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

        {tab === 'users' && (
          <>
            {/* Users Stats */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-600">Tổng người dùng</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{usersRowCount}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-600">Đang hiển thị</div>
                <div className="mt-2 text-3xl font-bold text-blue-600">{users.length}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-600">Đang hoạt động</div>
                <div className="mt-2 text-3xl font-bold text-emerald-600">
                  {users.filter((u) => u.isActive).length}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border bg-white px-3">
                <Search className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  value={qUsers}
                  onChange={(e) => setQUsers(e.target.value)}
                  placeholder="Tìm theo tên, email, số điện thoại…"
                  className="h-10 w-full outline-none"
                />
              </div>
            </div>

            {/* Users Grid */}
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-600 bg-white rounded-2xl">
                <RefreshCw className="h-5 w-5 animate-spin" /> Đang tải…
              </div>
            ) : users.length ? (
              <div className="space-y-3">
                {users
                  .filter((u) =>
                    !qUsers
                      ? true
                      : u.fullName.toLowerCase().includes(qUsers.toLowerCase()) ||
                        u.email.toLowerCase().includes(qUsers.toLowerCase()) ||
                        u.phoneNumber.includes(qUsers)
                  )
                  .map((user) =>
                    editingUserRole === user.id ? (
                      // Role Edit Modal
                      <div
                        key={user.id}
                        className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 shadow-lg"
                      >
                        <div className="mb-3">
                          <div className="text-sm font-semibold text-slate-900">
                            Chỉnh sửa Role: <span className="text-blue-600">{user.fullName}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-600">{user.email}</div>
                        </div>

                        <div className="mb-4 space-y-2">
                          {['Customer', 'Staff', 'Admin'].map((role) => (
                            <label key={role} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editingUserRoles.includes(role)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingUserRoles([...editingUserRoles, role]);
                                  } else {
                                    setEditingUserRoles(editingUserRoles.filter((r) => r !== role));
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{role}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={onSaveUserRole}
                            disabled={savingRole}
                            className="flex-1 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {savingRole ? 'Đang lưu…' : 'Lưu'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserRole(null);
                              setEditingUserRoles([]);
                            }}
                            className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      // User Card
                      <div
                        key={user.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Username */}
                          <div className="pb-4 md:pb-0 md:border-r md:border-slate-200">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Username
                            </div>
                            <div className="mt-1 font-mono text-sm font-medium text-slate-900">
                              {user.userName}
                            </div>
                          </div>

                          {/* Full Name */}
                          <div className="pb-4 md:pb-0 md:border-r md:border-slate-200 md:pl-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Họ Tên
                            </div>
                            <div className="mt-1 text-sm font-medium text-slate-900">
                              {user.fullName}
                            </div>
                          </div>

                          {/* Email */}
                          <div className="pb-4 md:pb-0 md:border-r md:border-slate-200 md:pl-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Email
                            </div>
                            <div className="mt-1 text-sm text-slate-600 truncate">{user.email}</div>
                          </div>

                          {/* Roles */}
                          <div className="pb-4 md:pb-0 md:border-r md:border-slate-200 md:pl-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Roles
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                                  >
                                    {role}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-500">Không có role</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="md:pl-4">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Hành động
                            </div>
                            <button
                              onClick={() => onEditUserRole(user.id, user.roles || [])}
                              className="mt-1 w-full text-xs rounded-lg bg-sky-600 text-white px-2 py-1 hover:bg-sky-700 font-medium"
                            >
                              Chỉnh sửa
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-600">Không có người dùng nào</p>
              </div>
            )}
          </>
        )}

        {tab === 'assign-roles' && (
          <>
            {/* Assign Roles Header */}
            <div className="mb-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Gán Quyền Cho Người Dùng</h2>
                <p className="text-slate-600">Chọn người dùng và gán các quyền (roles) phù hợp</p>
              </div>
            </div>

            {/* Search Users */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl border bg-white px-3">
                <Search className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  value={qUsers}
                  onChange={(e) => setQUsers(e.target.value)}
                  placeholder="Tìm theo tên, email, số điện thoại…"
                  className="h-10 w-full outline-none"
                />
              </div>
            </div>

            {/* Users List for Role Assignment */}
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-600 bg-white rounded-2xl">
                <RefreshCw className="h-5 w-5 animate-spin" /> Đang tải…
              </div>
            ) : users.length ? (
              <div className="grid gap-4">
                {users
                  .filter((u) =>
                    !qUsers
                      ? true
                      : u.fullName.toLowerCase().includes(qUsers.toLowerCase()) ||
                        u.email.toLowerCase().includes(qUsers.toLowerCase()) ||
                        u.phoneNumber.includes(qUsers)
                  )
                  .map((user) =>
                    editingUserRole === user.id ? (
                      // Role Edit Modal
                      <div
                        key={user.id}
                        className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5 shadow-lg"
                      >
                        <div className="mb-4">
                          <div className="text-lg font-semibold text-slate-900">
                            Gán quyền cho: <span className="text-emerald-600">{user.fullName}</span>
                          </div>
                          <div className="mt-1 text-sm text-slate-600">Email: {user.email}</div>
                          <div className="text-sm text-slate-600">ĐT: {user.phoneNumber}</div>
                        </div>

                        <div className="mb-6 space-y-3 border-t pt-4">
                          <div className="text-sm font-medium text-slate-700">Chọn quyền:</div>
                          {['Customer', 'Staff', 'Admin'].map((role) => (
                            <label
                              key={role}
                              className="flex items-center gap-3 text-sm cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={editingUserRoles.includes(role)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingUserRoles([...editingUserRoles, role]);
                                  } else {
                                    setEditingUserRoles(editingUserRoles.filter((r) => r !== role));
                                  }
                                }}
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-slate-700">{role}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={onSaveUserRole}
                            disabled={savingRole}
                            className="flex-1 rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {savingRole ? 'Đang lưu…' : '✓ Lưu quyền'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserRole(null);
                              setEditingUserRoles([]);
                            }}
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      // User Card
                      <div
                        key={user.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{user.fullName}</div>
                            <div className="text-sm text-slate-600">{user.email}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              ĐT: {user.phoneNumber}
                            </div>
                            <div className="mt-3 flex gap-1 flex-wrap">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                                  >
                                    {role}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-500 italic">Chưa có quyền</span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => onEditUserRole(user.id, user.roles || [])}
                            className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700 transition-colors whitespace-nowrap"
                          >
                            ✏️ Chỉnh sửa
                          </button>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-600">Không có người dùng nào</p>
              </div>
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
