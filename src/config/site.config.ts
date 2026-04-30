import treeRemoval from "@/assets/services/client/tree-removal.jpg";
import stumpGrinding from "@/assets/services/client/stump-grinding-1.jpg";
import treePruning from "@/assets/services/client/tree-pruning.jpg";
import emergencyRemoval from "@/assets/services/client/emergency-removal.jpg";
import landClearing from "@/assets/services/client/land-clearing.jpg";
import debrisRemoval from "@/assets/services/client/debris-removal.jpg";
import bucketLiftHouse from "@/assets/services/client/bucket-lift-house.jpg";
import stumpGrinding3 from "@/assets/services/client/stump-grinding-3.jpg";
import climberPine from "@/assets/services/client/climber-pine.jpg";
import bucketLiftTrim from "@/assets/services/client/bucket-lift-trim.jpg";
import skidSteer from "@/assets/services/client/skid-steer.jpg";
import brushRemoval from "@/assets/services/client/brush-removal.jpg";

export const SITE_CONFIG = {
  business: {
    name: "IGY6 Rooted",
    phone: "(518) 265-0275",
    email: "CO@IGY6Rooted.com",
    address: "Niceville, FL 32578",
    hours: "Mon-Sun 7:00 AM - 9:00 PM CST",
    jobberUrl: "https://clienthub.getjobber.com/hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/requests/2162555/new",
  },
  hero: {
    title: "Full-Service Tree Removal, Pruning & Stump Grinding",
    subtitle: "From routine trimming to emergency storm response, we handle every aspect of tree care for residential and commercial properties across Okaloosa, Walton, Santa Rosa, and Escambia counties.",
    cta1: "Get Free Estimate",
    cta2: "Our Services",
  },
  about: {
    title: "Proudly Serving Northwest Florida",
    body1: "Since founding IGY6 Rooted in April 2024, we have been helping homeowners across the Destin Fort Walton Beach area.",
    body2: "Craig Orner brings military precision to every job. No gimmicks. Just professionalism.",
  },
  services: [
    { name: "Tree Removal", href: "/blog/fallen-trees-insurance-claims", desc: "Safe removal of hazardous trees.", fact: "Did you know: nearly 1 in 4 homeowner property damage claims involve a fallen tree.", image: treeRemoval, alt: "IGY6 Rooted crew safely removing a large tree at a Niceville, FL home" },
    { name: "Stump Grinding", href: "/blog/stumps-attract-termites", desc: "Complete stump removal below ground level.", fact: "Did you know: untreated stumps can attract termites within 6 months — and they often spread to nearby homes.", image: stumpGrinding, alt: "Professional stump grinder cutting a freshly removed tree stump below grade" },
    { name: "Tree Trimming", href: "/blog/trimming-extends-tree-lifespan", desc: "Professional shaping for healthy trees.", fact: "Did you know: regular trimming can extend a healthy tree's lifespan by 30% or more.", image: bucketLiftTrim, alt: "Bucket lift trimming overhanging tree limbs above a Florida residential home" },
    { name: "Tree Pruning", href: "/blog/pruning-prevents-tree-failures", desc: "Precision pruning for growth and structure.", fact: "Did you know: most structural tree failures trace back to poor pruning in the first 10 years.", image: treePruning, alt: "Arborist pruning dead branches from a mature tree for healthy growth" },
    { name: "Emergency Tree Removal", href: "/blog/florida-named-storms-emergency-response", desc: "24/7 storm damage response.", fact: "Did you know: Florida averages more named storms than any other U.S. state — fast response matters.", image: emergencyRemoval, alt: "Emergency tree removal crew responding to storm-damaged tree on a property" },
    { name: "Climbing & Rigging", href: "/blog/climbing-rigging-dangerous-jobs", desc: "Skilled climbers for tight, high-risk jobs.", fact: "Did you know: tree work is one of the top 10 most dangerous jobs in America — leave the climbing to the pros.", image: climberPine, alt: "IGY6 Rooted climber rigging a tall pine tree for controlled removal in Northwest Florida" },
    { name: "Storm Cleanup", href: "/blog/hurricane-tree-debris-cleanup", desc: "Post-storm tree work and property recovery.", fact: "Did you know: a single hurricane can drop thousands of pounds of tree debris on a Florida lot.", image: bucketLiftHouse, alt: "IGY6 Rooted crew with bucket lift performing post-storm tree cleanup at a Florida home" },
    { name: "Hazard Tree Assessment", href: "/blog/hazard-tree-assessment-checklist", desc: "Spot risk trees before they fail.", fact: "Did you know: most trees that fall on homes show warning signs months before they let go.", image: stumpGrinding3, alt: "Arborist inspecting a mature tree for structural defects and decay" },
    { name: "Land Clearing", href: "/blog/land-clearing-property-value", desc: "Lot prep and brush clearing with skid steer.", fact: "Did you know: professional land clearing can boost a vacant lot's market value by 20–40%.", image: skidSteer, alt: "Green skid steer clearing brush and prepping a residential lot in Niceville, FL" },
    { name: "Lot Clearing", href: "/blog/lot-clearing-new-construction-permits", desc: "Full lot prep — stumps, brush, and debris cleared.", fact: "Did you know: Florida building permits often require a fully cleared lot before foundation work begins.", image: landClearing, alt: "Cleared residential lot ready for construction in Northwest Florida" },
    { name: "Brush Removal", href: "/blog/brush-wildfire-defensible-space", desc: "Clear overgrowth and undergrowth fast.", fact: "Did you know: dense brush within 30 ft of a home is one of the top wildfire risk factors.", image: brushRemoval, alt: "Cleared brush and undergrowth along a Northwest Florida property line" },
    { name: "Debris Removal", href: "/blog/yard-debris-pest-habitat", desc: "Full cleanup and haul-away.", fact: "Did you know: piled yard debris becomes a snake and rodent habitat in under 2 weeks in Florida's climate.", image: debrisRemoval, alt: "Crew loading tree debris and branches for haul-away after a tree job" },
  ],
};
