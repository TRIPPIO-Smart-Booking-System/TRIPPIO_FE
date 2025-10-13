'use client';

type Policy = {
  checkin_time?: string;
  checkout_time?: string;
  cancel_rules?: string[];
  child_policy?: string;
  pet_policy?: string;
  tax_fees?: { label: string; amount: number }[];
};

export default function PolicySection({ policy }: { policy: Policy }) {
  return (
    <section className="rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Chính sách lưu trú</h2>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Card title="Giờ nhận/trả phòng">
          <ul className="text-sm text-zinc-700">
            {policy.checkin_time && <li>Nhận phòng: {policy.checkin_time}</li>}
            {policy.checkout_time && <li>Trả phòng: {policy.checkout_time}</li>}
          </ul>
        </Card>

        <Card title="Chính sách hủy">
          <ul className="list-disc pl-5 text-sm text-zinc-700">
            {policy.cancel_rules?.map((r, i) => <li key={i}>{r}</li>) || <li>Không hỗ trợ hủy.</li>}
          </ul>
        </Card>

        {policy.child_policy && (
          <Card title="Trẻ em/giường phụ">
            <p className="text-sm text-zinc-700">{policy.child_policy}</p>
          </Card>
        )}

        {policy.pet_policy && (
          <Card title="Thú cưng">
            <p className="text-sm text-zinc-700">{policy.pet_policy}</p>
          </Card>
        )}

        {policy.tax_fees && (
          <Card title="Thuế & phí">
            <ul className="text-sm text-zinc-700">
              {policy.tax_fees.map((t, i) => (
                <li key={i}>
                  {t.label}: {t.amount.toLocaleString('vi-VN')} ₫
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-2 font-medium">{title}</div>
      {children}
    </div>
  );
}
