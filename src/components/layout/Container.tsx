type Props = React.PropsWithChildren<{ className?: string }>;

export default function Container({ children, className = '' }: Props) {
  return <div className={`mx-auto max-w-screen-2xl px-4 md:px-6 ${className}`}>{children}</div>;
}
