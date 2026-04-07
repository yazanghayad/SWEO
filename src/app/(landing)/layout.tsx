import { SweoNavbar, SweoFooter } from '@/features/overview/components/sweo';

export default function LandingSubpageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sweo-page">
      <link
        rel="stylesheet"
        href="/fin-assets/css/fin-tailwind-utils.css"
        precedence="low"
      />
      <link
        rel="stylesheet"
        href="/fin-assets/css/7762e0f9f65e90f0.css"
        precedence="low"
      />
      <link
        rel="stylesheet"
        href="/fin-assets/css/196dc0c3ba730725.css"
        precedence="low"
      />
      <SweoNavbar />
      <div className="pt-16">{children}</div>
      <SweoFooter/>
    </div>
  );
}