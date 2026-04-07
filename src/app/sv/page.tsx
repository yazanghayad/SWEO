import {
  SweoNavbar,
  SweoHero,
  SweoLogoBanner,
  SweoChapterNav,
  SweoCapabilities,
  SweoPerformance,
  SweoIntegrations,
  SweoTechnology,
  SweoTrust,
  SweoAITeam,
  SweoCTABanner,
  SweoFooter
} from '@/features/overview/components/sweo';

export default function SvHomePage() {
  return (
    <div className="sweo-page">
      <SweoNavbar />
      <SweoHero />
      <SweoLogoBanner />

      {/* Main content area with chapter sidebar */}
      <div className="sweo-main-grid">
        {/* Sticky chapter nav sidebar */}
        <SweoChapterNav />

        {/* Sections */}
        <div className="sweo-main-content">
          <SweoCapabilities />
          <SweoPerformance />
          <SweoIntegrations />
          <SweoTechnology />
          <SweoTrust />
          <SweoAITeam />
        </div>
      </div>

      <SweoCTABanner />
      <SweoFooter />
    </div>
  );
}
