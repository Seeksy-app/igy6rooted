import { ServicePageTemplate } from "@/components/public/ServicePageTemplate";

const defaultBenefits = [
  "Veteran-owned & operated",
  "Fully licensed & insured",
  "Free estimates — always",
  "Complete cleanup included",
  "DigSafe utility checks",
  "Respect for your property",
];

export function TreeRemovalPage() {
  return (
    <ServicePageTemplate
      title="Tree Removal"
      metaTitle="Tree Removal in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional tree removal services in Northwest Florida. Safe, efficient removal of hazardous or unwanted trees. Free estimates. Call (518) 265-0275."
      heroText="Safe, professional removal of hazardous, diseased, or unwanted trees — with complete cleanup included."
      sections={[
        {
          heading: "Professional Tree Removal You Can Trust",
          content: "Tree removal is one of IGY6 Rooted's main specialties. We know that when a tree poses a threat or risk to your home or property, you want the job done right.\n\nThere are many reasons why a tree might need to be removed. Trees may be diseased or dying, leaning dangerously toward your home, blocking construction projects, or have roots damaging your foundation or driveway. Storm damage can also weaken tree structures, making removal necessary for safety.",
        },
        {
          heading: "Our Approach",
          content: "We assess each tree carefully before removal, considering factors like nearby structures, power lines, and landscaping. Each job is unique — we make sure to account for your personal needs every time.\n\nEvery tree removal includes complete cleanup and debris hauling. We leave your property cleaner than we found it.",
        },
        {
          heading: "Not Sure If Your Tree Needs Removal?",
          content: "Give us a call — we'll come to you and give you our honest opinion of your situation so you can make an informed decision. No pressure, no sales pitch.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Stump Grinding", href: "/services/stump-grinding" },
        { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal" },
        { name: "Debris Removal", href: "/services/debris-removal" },
      ]}
    />
  );
}

export function TreeTrimmingPage() {
  return (
    <ServicePageTemplate
      title="Tree Trimming"
      metaTitle="Tree Trimming in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional tree trimming in Northwest Florida. Remove overgrowth, shape trees, prevent storm damage. Free estimates. Call (518) 265-0275."
      heroText="Keep your trees healthy, safe, and looking their best with professional trimming services."
      sections={[
        {
          heading: "Why Tree Trimming Matters",
          content: "Most people don't think about maintaining their trees until it becomes a problem. Branches scraping against your roof, blocking your view, or hanging over power lines can become serious hazards — especially during Florida's hurricane season.\n\nTree trimming focuses on removing unwanted growth and shaping your trees for safety and appearance. We cut back overgrown branches, clear limbs away from structures, and open up canopies to let more light reach your yard.",
        },
        {
          heading: "Prevent Storm Damage",
          content: "Regular tree trimming prevents branches from becoming too heavy and reduces the risk of storm damage. This is especially important along the Emerald Coast where hurricane season can cause significant property damage from poorly maintained trees.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Tree Pruning", href: "/services/tree-pruning" },
        { name: "Tree Removal", href: "/services/tree-removal" },
        { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal" },
      ]}
    />
  );
}

export function TreePruningPage() {
  return (
    <ServicePageTemplate
      title="Tree Pruning"
      metaTitle="Tree Pruning in Niceville, FL | IGY6 Rooted"
      metaDescription="Expert tree pruning in Northwest Florida. Remove dead and diseased branches, improve tree health. Free estimates. Call (518) 265-0275."
      heroText="Specialized care that targets the health of your trees — remove disease, improve circulation, and strengthen growth."
      sections={[
        {
          heading: "More Than Just Cutting Branches",
          content: "Tree pruning is specialized work that targets the health of your trees. We remove dead, diseased, or damaged branches that can spread problems to healthy parts of the tree.\n\nProper pruning also involves thinning crowded areas to improve air circulation and removing crossing branches that rub against each other — both of which can lead to disease and decay if left unattended.",
        },
        {
          heading: "Pruning vs. Trimming",
          content: "While trimming focuses on shape and safety, pruning focuses on your tree's long-term health. Both services help your trees grow stronger while protecting your property investment.\n\nNot sure what your trees need? We offer free estimates to assess your specific situation and recommend the right approach for your landscape.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Tree Trimming", href: "/services/tree-trimming" },
        { name: "Tree Removal", href: "/services/tree-removal" },
        { name: "Landscaping", href: "/services/landscaping" },
      ]}
    />
  );
}

export function StumpGrindingPage() {
  return (
    <ServicePageTemplate
      title="Stump Grinding"
      metaTitle="Stump Grinding in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional stump grinding in Northwest Florida. Grind stumps below ground level for a clean yard. Free estimates. Call (518) 265-0275."
      heroText="Our specialty — grind stumps below ground level for a clean, flat, usable yard."
      sections={[
        {
          heading: "Get Rid of Ugly Stumps",
          content: "Old tree stumps aren't just eyesores — they can attract termites, create tripping hazards, and make mowing difficult. Our stump grinding service removes stumps below ground level, leaving your yard clean and ready to use.\n\nWe use professional-grade stump grinding equipment that can handle stumps of any size, from small ornamental tree stumps to massive hardwood stumps.",
        },
        {
          heading: "Clean Results, No Damage",
          content: "What sets IGY6 Rooted apart is our commitment to respecting your yard. We carefully grind each stump to the appropriate depth, clean up all debris, and leave the area ready for grass seed or landscaping.\n\nWe protect your lawn and surrounding landscape throughout the process — no ruts, no mess.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Tree Removal", href: "/services/tree-removal" },
        { name: "Land Clearing", href: "/services/land-clearing" },
        { name: "Landscaping", href: "/services/landscaping" },
      ]}
    />
  );
}

export function EmergencyTreeRemovalPage() {
  return (
    <ServicePageTemplate
      title="Emergency Tree Removal"
      metaTitle="Emergency Tree Removal in Niceville, FL | IGY6 Rooted"
      metaDescription="24/7 emergency tree removal in Northwest Florida. Fallen trees, storm damage, urgent hazards. Call (518) 265-0275 immediately."
      heroText="24/7 rapid response for fallen trees, storm damage, and urgent safety hazards. Don't wait — call us immediately."
      sections={[
        {
          heading: "When Every Minute Counts",
          content: "Some tree removals require immediate attention. Many homeowners don't realize how quickly partially fallen trees can shift and fall unexpectedly. This can easily cause damage to your home, vehicles, or worse — hurt you or your loved ones.\n\nAt IGY6 Rooted, we take emergency tree removals very seriously and prioritize them. After you reach out, we'll assess any risks and get to work immediately.",
        },
        {
          heading: "Common Emergency Situations",
          content: "A tree has fallen across your driveway. A tree is leaning dangerously close to power lines after a storm. A tree trunk has split, making it unstable and likely to fall toward your home.\n\nYou don't want to hesitate if you have a tree emergency. Even if you're not sure, it's better to be safe than sorry. Call us immediately — even outside of normal business hours.",
        },
      ]}
      benefits={[...defaultBenefits, "Available outside normal hours", "Rapid response times"]}
      relatedServices={[
        { name: "Tree Removal", href: "/services/tree-removal" },
        { name: "Debris Removal", href: "/services/debris-removal" },
        { name: "Stump Grinding", href: "/services/stump-grinding" },
      ]}
    />
  );
}

export function DebrisRemovalPage() {
  return (
    <ServicePageTemplate
      title="Debris Removal"
      metaTitle="Debris Removal Service in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional debris removal and cleanup in Northwest Florida. Storm damage, branches, limbs hauled away. Free estimates. Call (518) 265-0275."
      heroText="Complete cleanup and hauling of branches, limbs, and storm debris from your property."
      sections={[
        {
          heading: "Complete Property Cleanup",
          content: "Whether after a storm, tree removal, or general property maintenance, we handle all debris removal and hauling. No mess left behind.\n\nWe bring the right equipment to handle debris of any size — from small branch piles to entire trees worth of material.",
        },
        {
          heading: "Storm Damage Cleanup",
          content: "Northwest Florida's storm season can leave your property covered in fallen branches, leaves, and tree debris. We provide fast, efficient cleanup so you can get back to normal as quickly as possible.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal" },
        { name: "Brush Removal", href: "/services/brush-removal" },
        { name: "Lot Clearing", href: "/services/lot-clearing" },
      ]}
    />
  );
}

export function LandscapingPage() {
  return (
    <ServicePageTemplate
      title="Landscaping"
      metaTitle="Landscaping Services in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional landscaping services in Northwest Florida. Design and installation for beautiful outdoor spaces. Free estimates. Call (518) 265-0275."
      heroText="Transform your outdoor spaces with professional landscaping design and installation."
      sections={[
        {
          heading: "Beautify Your Property",
          content: "Beyond tree services, we offer landscaping to help you create the outdoor space you've always wanted. From planting to design, we bring the same military precision and attention to detail to every landscaping project.",
        },
        {
          heading: "Complete Outdoor Solutions",
          content: "Whether you need new plantings after tree removal, a complete landscape redesign, or ongoing maintenance, we have the expertise to deliver beautiful results. We work with Florida-friendly plants and materials suited to the Emerald Coast climate.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Tree Pruning", href: "/services/tree-pruning" },
        { name: "Land Clearing", href: "/services/land-clearing" },
        { name: "Brush Removal", href: "/services/brush-removal" },
      ]}
    />
  );
}

export function LandClearingPage() {
  return (
    <ServicePageTemplate
      title="Land Clearing"
      metaTitle="Land Clearing in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional land clearing in Northwest Florida. Prepare your property for construction or development. Free estimates. Call (518) 265-0275."
      heroText="Prepare your property for construction, development, or a fresh start with professional land clearing."
      sections={[
        {
          heading: "Clear the Way for Your Project",
          content: "Whether you're preparing for new construction, creating a building pad, or converting overgrown land into usable space, our land clearing service removes all vegetation, stumps, and debris efficiently and thoroughly.",
        },
        {
          heading: "Equipment & Expertise",
          content: "We bring the right heavy equipment for the job and handle everything from small residential lots to larger commercial parcels. Every project includes complete debris removal and site preparation.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Lot Clearing", href: "/services/lot-clearing" },
        { name: "Stump Grinding", href: "/services/stump-grinding" },
        { name: "Brush Removal", href: "/services/brush-removal" },
      ]}
    />
  );
}

export function LotClearingPage() {
  return (
    <ServicePageTemplate
      title="Lot Clearing"
      metaTitle="Lot Clearing in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional lot clearing in Northwest Florida. Complete residential and commercial lot preparation. Free estimates. Call (518) 265-0275."
      heroText="Complete lot preparation including vegetation, stumps, and debris removal for residential and commercial properties."
      sections={[
        {
          heading: "Ready-to-Build Lots",
          content: "Our lot clearing service covers everything needed to take a property from overgrown to construction-ready. We remove all trees, stumps, brush, and debris, leaving you with a clean, level surface.",
        },
        {
          heading: "Residential & Commercial",
          content: "Whether it's a single home lot or a larger commercial property, we scale our equipment and crew to match the job. We work efficiently to minimize disruption and complete projects on schedule.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Land Clearing", href: "/services/land-clearing" },
        { name: "Stump Grinding", href: "/services/stump-grinding" },
        { name: "Debris Removal", href: "/services/debris-removal" },
      ]}
    />
  );
}

export function BrushRemovalPage() {
  return (
    <ServicePageTemplate
      title="Brush Removal"
      metaTitle="Brush Removal in Niceville, FL | IGY6 Rooted"
      metaDescription="Professional brush removal and clearing in Northwest Florida. Clear overgrown vegetation for safety and aesthetics. Free estimates. Call (518) 265-0275."
      heroText="Clear overgrown brush and undergrowth for fire safety, aesthetics, and usable outdoor space."
      sections={[
        {
          heading: "Take Back Your Property",
          content: "Overgrown brush can be a fire hazard, attract pests, and make your property look neglected. Our brush removal service clears away dense undergrowth, vines, and small trees to restore your land.",
        },
        {
          heading: "Fire Prevention & Property Value",
          content: "In Florida's dry seasons, overgrown brush can become a serious fire risk. Regular brush clearing not only improves safety but also boosts your property value and curb appeal. We handle everything from small backyard areas to large acreage.",
        },
      ]}
      benefits={defaultBenefits}
      relatedServices={[
        { name: "Debris Removal", href: "/services/debris-removal" },
        { name: "Land Clearing", href: "/services/land-clearing" },
        { name: "Landscaping", href: "/services/landscaping" },
      ]}
    />
  );
}
