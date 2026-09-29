import React from 'react';
import { useContent } from '../content/index.js';
import { isEmail } from '../lib/text.js';

/** بيانات منظمة (schema.org) — تُفعَّل فقط بعد تحديد النطاق النهائي في company.url. */
export default function StructuredData() {
  const { company, contact, seo } = useContent();
  if (!company.url) return null;
  const abs = (path) => new URL(path, company.url).href;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: company.name,
    ...(company.nameEn ? { alternateName: company.nameEn } : {}),
    url: company.url,
    logo: abs(company.logo.src),
    image: abs(seo.ogImage),
    description: seo.description,
    ...(isEmail(contact.email) ? { email: contact.email.trim() } : {}),
    ...(contact.openingHours?.length ? { openingHours: contact.openingHours } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
