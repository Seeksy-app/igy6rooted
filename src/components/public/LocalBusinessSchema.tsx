import { Helmet } from "react-helmet-async";

/**
 * AggregateRating SCAFFOLD — gated off until live Google Reviews payload is wired.
 * To enable: set ENABLE_AGGREGATE_RATING = true and supply real values from the
 * google-reviews edge function (ratingValue, reviewCount). DO NOT enable with
 * placeholder data — Google penalizes fake review markup.
 */
const ENABLE_AGGREGATE_RATING = false;
const aggregateRatingScaffold = {
  "@type": "AggregateRating",
  ratingValue: "0.0",   // populate from google-reviews edge function
  reviewCount: 0,       // populate from google-reviews edge function
  bestRating: "5",
  worstRating: "1",
};

export function LocalBusinessSchema() {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "IGY6 Rooted Stump Grinding & Tree Service",
    description:
      "Veteran-owned tree service company serving Northwest Florida. Specializing in stump grinding, tree removal, trimming, pruning, and emergency tree services.",
    url: "https://igy6rooted.com",
    telephone: "+1-518-265-0275",
    email: "CO@IGY6Rooted.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Niceville",
      addressRegion: "FL",
      postalCode: "32578",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.5169,
      longitude: -86.4822,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
        ],
        opens: "07:00",
        closes: "21:00",
      },
    ],
    areaServed: [
      "Niceville, FL", "Destin, FL", "Fort Walton Beach, FL", "Crestview, FL",
      "Navarre, FL", "Bluewater Bay, FL", "Valparaiso, FL", "Shalimar, FL",
      "Mary Esther, FL", "Santa Rosa Beach, FL", "Miramar Beach, FL", "Freeport, FL",
    ],
    priceRange: "$$",
    image: "https://igy6rooted.com/favicon.png",
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tree Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tree Removal" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tree Trimming" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tree Pruning" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Stump Grinding" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Emergency Tree Removal" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Debris Removal" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Landscaping" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Land Clearing" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lot Clearing" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Brush Removal" } },
      ],
    },
  };

  if (ENABLE_AGGREGATE_RATING) {
    schema.aggregateRating = aggregateRatingScaffold;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
