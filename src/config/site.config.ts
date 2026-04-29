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
    { name: "Tree Removal", href: "/services/tree-removal", desc: "Safe removal of hazardous trees.", fact: "Did you know: nearly 1 in 4 homeowner insurance claims in {location} involve a fallen tree.", image: treeRemoval, alt: "IGY6 Rooted crew safely removing a large tree at a Niceville, FL home" },
    { name: "Stump Grinding", href: "/services/stump-grinding", desc: "Complete stump removal below ground level.", fact: "Did you know: in {location}'s climate, untreated stumps can attract termites within 6 months.", image: stumpGrinding, alt: "Professional stump grinder cutting a freshly removed tree stump below grade" },
    { name: "Tree Trimming", href: "/services/tree-trimming", desc: "Professional shaping for healthy trees.", fact: "Did you know: regular trimming can extend a {location} tree's lifespan by 30% or more.", image: bucketLiftTrim, alt: "Bucket lift trimming overhanging tree limbs above a Florida residential home" },
    { name: "Tree Pruning", href: "/services/tree-pruning", desc: "Precision pruning for growth and structure.", fact: "Did you know: most structural failures on {location} oaks trace back to poor pruning early on.", image: treePruning, alt: "Arborist pruning dead branches from a mature tree for healthy growth" },
    { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal", desc: "24/7 storm damage response.", fact: "Did you know: {location} sits in one of Florida's most active hurricane corridors — fast response matters.", image: emergencyRemoval, alt: "Emergency tree removal crew responding to storm-damaged tree on a property" },
    { name: "Climbing & Rigging", href: "/services/tree-removal", desc: "Skilled climbers for tight, high-risk jobs.", fact: "Did you know: tree work is one of America's top 10 most dangerous jobs — leave {location} climbs to pros.", image: climberPine, alt: "IGY6 Rooted climber rigging a tall pine tree for controlled removal in Northwest Florida" },
    { name: "Storm Cleanup", href: "/services/emergency-tree-removal", desc: "Post-storm tree work and property recovery.", fact: "Did you know: a single hurricane can drop thousands of pounds of tree debris on the average {location} lot.", image: bucketLiftHouse, alt: "IGY6 Rooted crew with bucket lift performing post-storm tree cleanup at a Florida home" },
    { name: "Stump Removal", href: "/services/stump-grinding", desc: "Below-grade grinding for a flat, usable yard.", fact: "Did you know: a single ground stump frees up about 25 sq ft of usable yard in {location}.", image: stumpGrinding3, alt: "Freshly ground tree stump with surrounding mulch in a residential backyard" },
    { name: "Land Clearing", href: "/services/land-clearing", desc: "Lot prep and brush clearing with skid steer.", fact: "Did you know: cleared lots in {location} can sell for 20–40% more than overgrown ones.", image: skidSteer, alt: "Green skid steer clearing brush and prepping a residential lot in Niceville, FL" },
    { name: "Lot Clearing", href: "/services/lot-clearing", desc: "Full lot prep — stumps, brush, and debris cleared.", fact: "Did you know: building permits in {location} often require a fully cleared lot before foundation work begins.", image: landClearing, alt: "Cleared residential lot ready for construction in Northwest Florida" },
    { name: "Brush Removal", href: "/services/brush-removal", desc: "Clear overgrowth and undergrowth fast.", fact: "Did you know: dense brush within 30 ft of a {location} home is a top wildfire risk factor.", image: brushRemoval, alt: "Cleared brush and undergrowth along a Northwest Florida property line" },
    { name: "Debris Removal", href: "/services/debris-removal", desc: "Full cleanup and haul-away.", fact: "Did you know: piled yard debris becomes a snake and rodent habitat in under 2 weeks in {location}'s climate.", image: debrisRemoval, alt: "Crew loading tree debris and branches for haul-away after a tree job" },
  ],
};
