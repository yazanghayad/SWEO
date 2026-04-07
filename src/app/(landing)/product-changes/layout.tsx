export default function ProductChangesLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="/assets/newsfeed_web-d1f0514e5d7e7d559eed17d9b636e4f21fd54be45a40b1cd475cd4c89494d8c5.css"
        precedence="low"
      />
      <style
        precedence="low"
        href="product-changes-theme"
      >{`
        .header, .avatar__image-extra { background-color: #000000; }
        .newsitem a, .c__primary { color: #000000; }
        .newsitem a.intercom-h2b-button { background-color: #000000; border: 0; }
        .newsitem_label { background: #000000; }
        .pagy-nav .page.active { background-color: #000000; }
        .avatar__fallback { background-color: #000000; }
        .header { background-image: url('/i/o/fin4all/695209/2a52531491371af72e0d85d298dd/ef5cce70c2e46f741f3af64b7e8d23f3.png'); }
      `}</style>
      {children}
    </>
  );
}
