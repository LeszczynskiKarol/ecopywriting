// src/components/JsonLd.tsx
import Script from 'next/script'

export default function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "eCopywriting.pl",
        "description": "Profesjonalne usługi copywriterskie i content marketingowe",
        "url": "https://www.ecopywriting.pl",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Papowo Biskupie",
            "addressRegion": "Kujawsko-pomorskie",
            "addressCountry": "PL"
        },
        "priceRange": "$$",
        "openingHours": "Mo-Fr 09:00-20:00",
        "telephone": "+48509370772",
        "email": "kontakt@ecopywriting.pl",
        "offers": {
            "@type": "AggregateOffer",
            "name": "Usługi copywriterskie",
            "offers": [
                {
                    "@type": "Offer",
                    "name": "Teksty SEO",
                    "description": "Profesjonalne teksty zoptymalizowane pod kątem SEO"
                },
                {
                    "@type": "Offer",
                    "name": "Artykuły eksperckie",
                    "description": "Specjalistyczne artykuły branżowe"
                }
            ]
        }
    }

    return (
        <Script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            strategy="beforeInteractive"
        />
    )
}