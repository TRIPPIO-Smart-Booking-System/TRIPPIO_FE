import Button from '@/components/ui/Button';
import Container from '@/components/layout/Container';

export default function Newsletter() {
  return (
    <section className="py-16">
      <Container>
        <div className="rounded-lg bg-primary p-8 text-primary-foreground md:p-12 lg:p-16">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Đăng ký nhận thông tin</h2>
            <p className="mt-4 max-w-2xl">
              Đăng ký để nhận thông tin về các ưu đãi và tour du lịch mới nhất từ Trippio
            </p>
            <div className="mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button className="h-12 bg-background text-foreground hover:bg-background/90">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
