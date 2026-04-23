import treeRemoval from "@/assets/services/tree-removal.jpg";
import stumpGrinding from "@/assets/services/stump-grinding.jpg";
import treeTrimming from "@/assets/services/tree-trimming.jpg";
import treePruning from "@/assets/services/tree-pruning.jpg";
import emergencyRemoval from "@/assets/services/emergency-removal.jpg";
import landscaping from "@/assets/services/landscaping.jpg";
import landClearing from "@/assets/services/land-clearing.jpg";
import debrisRemoval from "@/assets/services/debris-removal.jpg";

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
    title: "Tree Service, Lawn Care & Landscaping in Niceville, Fort Walton Beach, and Surrounding Areas",
    subtitle: "From safer trees to healthier grass, we help make your home look better and feel better.",
    cta1: "Get Free Estimate",
    cta2: "Our Services",
  },
  about: {
    title: "Proudly Serving Northwest Florida",
    body1: "Since founding IGY6 Rooted in April 2024, we have been helping homeowners across the Destin Fort Walton Beach area.",
    body2: "Craig Orner brings military precision to every job. No gimmicks. Just professionalism.",
  },
  services: [
    { name: "Tree Removal", href: "/services/tree-removal", desc: "Safe removal of hazardous trees.", image: treeRemoval },
    { name: "Stump Grinding", href: "/services/stump-grinding", desc: "Complete stump removal below ground level.", image: stumpGrinding },
    { name: "Tree Trimming", href: "/services/tree-trimming", desc: "Professional shaping for healthy trees.", image: treeTrimming },
    { name: "Tree Pruning", href: "/services/tree-pruning", desc: "Precision pruning for growth and structure.", image: treePruning },
    { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal", desc: "24/7 storm damage response.", image: emergencyRemoval },
    { name: "Landscaping", href: "/services/landscaping", desc: "Mulch, shrubs, and curb appeal.", image: landscaping },
    { name: "Land Clearing", href: "/services/land-clearing", desc: "Lot prep and brush clearing.", image: landClearing },
    { name: "Debris Removal", href: "/services/debris-removal", desc: "Full cleanup and haul-away.", image: debrisRemoval },
  ],
};
