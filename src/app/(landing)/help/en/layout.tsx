import '@/styles/fin-help-center.css';

export default function HelpEnLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="/fin-assets/css/95a79650f8d8b193.css"
        precedence="low"
      />
      {children}
    </>
  );
}
