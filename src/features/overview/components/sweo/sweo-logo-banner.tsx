'use client';

import Image from 'next/image';

/* ─── Company logo paths (customer-logos folder) ─── */
const logos = [
  '/img/customer-logos/10fae051f489fdf664b5c58da9b52cbbef73d96b-159x56.svg',
  '/img/customer-logos/297f63cd41a28a4090ee44681634631da0038bb8-217x56.svg',
  '/img/customer-logos/3a4e192c0d980dcec8427e3085acc2c5d7662f11-205x56.svg',
  '/img/customer-logos/4297edcafda5afdbc8c9b7fe3cea6a2ef2f98e90-173x56.svg',
  '/img/customer-logos/646cacea719f2356d2c71a422b38b3efe48c46aa-122x56.svg',
  '/img/customer-logos/68f7c4ee0b45903caf62eef45ffc3889277c52d7-166x56.svg',
  '/img/customer-logos/6c84c028902a19a6891dab9066393ce524442a34-173x56.svg',
  '/img/customer-logos/7a50f98ff4108d52d540013d924f4e221ba34f4a-188x56.svg',
  '/img/customer-logos/889e6c33dda2024ca0d068c257fa2373bce919f3-173x56.svg',
  '/img/customer-logos/97591a25e8bd5e9be81e635bd696acf55ee4b753-205x56.svg',
  '/img/customer-logos/9870e525466c3dcfaa86f6a6b0cec0a1684a87a4-119x56.svg',
  '/img/customer-logos/9d5d87af457200f494eaac30264d246b4b9009bb-141x56.svg',
  '/img/customer-logos/a892c8cec439bd01fe3948982417cf2c3cce3cd3-189x56.svg',
  '/img/customer-logos/ab9b9f7fa11e8a478ae11554c7e89e3f4f8dfb8b-188x56.svg',
  '/img/customer-logos/b75e68a9c1f7f46921d0a854d2adce2a6910e924-143x56.svg',
  '/img/customer-logos/bcbcddc448c2111ddeeea6e78bfe481f0588fd1d-180x56.svg',
  '/img/customer-logos/c1f2337303e581cbfe075d26180ac8034e04065f-234x56.svg',
  '/img/customer-logos/d0c4a46945acdf038467afbb7943b2721fe54606-208x56.svg',
  '/img/customer-logos/ec05e3a3922a12585cfa4310ff8c9eb43ef2b1f8-230x56.svg',
  '/img/customer-logos/fa4c60f154ab98ffe282e7a12e28e1c01d49eb18-180x56.svg',
];

/* ─── Logo Banner (scrolling company logos) ─── */
export function SweoLogoBanner() {
  const allLogos = [...logos, ...logos, ...logos];

  return (
    <div
      className="overflow-hidden py-4 sm:py-8 border-y border-white/10"
      role="region"
      aria-label="Trusted by leading companies"
    >
      <div className="sweo-logo-banner">
        {allLogos.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt="Customer company logo"
            role="img"
            width={140}
            height={40}
            className="h-7 w-auto opacity-40 brightness-0 invert sm:h-9"
          />
        ))}
      </div>
    </div>
  );
}
