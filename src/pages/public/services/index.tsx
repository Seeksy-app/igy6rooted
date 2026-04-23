import { ServicePageTemplate } from "@/components/public/ServicePageTemplate";
import heroOption1 from "@/assets/hero-option-1.jpg";
import heroOption2 from "@/assets/hero-option-2.jpg";
import heroOption3 from "@/assets/hero-option-3.jpg";
import heroOption4 from "@/assets/hero-option-4.jpg";
import heroMain from "@/assets/hero-tree-service.jpg";
import serviceSecondary from "@/assets/service-secondary.jpg";

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
      metaTitle="Tree Removal Niceville & Destin FL | IGY6 Rooted"
      metaDescription="Safe, professional tree removal in Niceville, Destin & Fort Walton Beach. Licensed, insured, veteran-owned. Free estimates — call (518) 265-0275."
      ogImage="/og/tree-removal.jpg"
      serviceKeyword="Tree Removal"
      heroText="Safe, professional removal of hazardous, diseased, or unwanted trees — with complete cleanup included."
      heroImage={heroOption1}
      heroImageAlt="Mature oak trees framing a Florida residential home before tree removal"
      midImage={serviceSecondary}
      midImageAlt="Freshly mulched ring around a healthy tree on a manicured lawn after professional tree care"
      midImageCaption="A clean, mulched ring is what's left after our crew finishes — no ruts, no debris."
      sections={[
        {
          heading: "Professional Tree Removal You Can Trust",
          content:
            "Tree removal is one of IGY6 Rooted's main specialties, and it's also one of the most misunderstood services in the industry. Most homeowners don't think about a tree on their property until something goes wrong — a limb crashes onto a fence, roots crack a driveway, or a hurricane warning forces a hard look at the leaning oak in the front yard. By that point, the conversation is no longer about whether to remove the tree, but how quickly it can be done safely.\n\nWhen the job is done right, tree removal is a precise, controlled operation that protects your home, your landscape, and the people on the property. When it's done wrong, it becomes a liability — for you and for the homeowner next door. That's why we treat every removal as a planned project rather than a quick visit. We assess each tree on its own terms before a chainsaw ever touches the trunk.\n\nThere are many reasons a tree might need to come down in Northwest Florida. Trees may be diseased or dying from pine bark beetles, oak wilt, or simple old age. They may be leaning dangerously toward your home after years of saturated soil or storm exposure. They may be blocking a planned addition, pool installation, or driveway expansion. They may have roots damaging your foundation, septic lines, or hardscape. And of course, hurricane and tropical storm activity along the Emerald Coast routinely weakens otherwise healthy trees in ways that aren't always visible from the ground.",
        },
        {
          heading: "Our Approach to Every Removal",
          content:
            "We assess each tree carefully before we begin. That means walking the entire job site, identifying nearby structures, power lines, fences, septic fields, irrigation, and hardscape, and planning a drop or rigging path that protects everything around the work zone. On a tight Niceville lot with a screened pool enclosure ten feet from the trunk, the approach is very different from a wide-open Crestview acre. We adapt our equipment, our crew positioning, and our cut sequence to match each property.\n\nFor straightforward removals, we'll fell the tree in controlled sections with rope guidance to keep limbs and the trunk landing exactly where we plan. For tight, high-risk jobs, we'll climb and rig — lowering each piece by rope to the ground crew so nothing free-falls onto your roof, your garden beds, or the neighbor's driveway. We use professional climbing systems, rated rigging hardware, and a spotter on the ground for every cut. Nothing about our process is improvised.\n\nEvery tree removal includes complete cleanup and debris hauling. We chip the brush, cut the trunk into manageable rounds (or haul it whole if you'd like the wood for firewood or milling), rake the area, and blow off your driveway, walkway, and lawn before we leave. The first thing most of our customers say when we wrap up is some version of 'I can't even tell you were here.' That's the standard we hold ourselves to on every single property.",
        },
        {
          heading: "Pricing, Permits & What to Expect",
          content:
            "Tree removal pricing varies widely because no two trees are the same. Size, species, lean, proximity to structures, access for equipment, and how the wood and brush will be handled all factor into the estimate. A 30-foot pine in the middle of an open backyard is a fundamentally different job than a 60-foot live oak hanging over a two-story home and a power drop. We give you an honest, line-itemed estimate after walking the property — never a guess over the phone.\n\nIn most parts of Okaloosa, Walton, Santa Rosa, and Escambia counties, removal of a tree on private residential property does not require a permit, but there are exceptions. Protected species like heritage live oaks, trees within wetland buffers, and trees in certain HOA-governed neighborhoods may require approval before removal. We're familiar with local rules and will tell you up front if a permit is likely to apply, and we'll never start a job that puts you on the wrong side of a code enforcement officer.",
        },
        {
          heading: "Not Sure If Your Tree Needs Removal?",
          content:
            "A lot of homeowners call us assuming a tree has to come down, only to find out that targeted pruning, cabling, or pest treatment can extend its life by another decade. Other times, the opposite is true — a tree that 'looks fine' is actually hollow at the base or has compromised root flare from past construction, and waiting another season is genuinely dangerous.\n\nGive us a call. We'll come to you, walk the property, and give you our honest opinion of your situation so you can make an informed decision. No pressure, no upsells, no sales pitch. If we think pruning or cabling is the right call instead of removal, that's exactly what we'll tell you, even though it's a smaller job. Trust is the entire business — we'd rather earn it once and keep your number in the books for the next ten years than oversell on a single visit.",
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
      metaTitle="Tree Trimming Niceville & Destin FL | IGY6 Rooted"
      metaDescription="Professional tree trimming in Niceville, Destin & Fort Walton Beach. Shape trees, prevent storm damage, improve health. Free estimates — (518) 265-0275."
      ogImage="/og/tree-trimming.jpg"
      serviceKeyword="Tree Trimming"
      heroText="Keep your trees healthy, safe, and looking their best with professional trimming services."
      heroImage={heroOption2}
      heroImageAlt="Mature pine and oak trees over a manicured Florida backyard lawn"
      midImage={heroOption3}
      midImageAlt="Striped manicured lawn beneath a healthy oak tree after professional trimming"
      midImageCaption="Properly thinned canopies let more light reach the lawn — and keep the tree itself healthier."
      sections={[
        {
          heading: "Why Tree Trimming Matters",
          content:
            "Most homeowners don't think about maintaining their trees until something becomes a problem. A branch starts scraping the roof every time the wind picks up. A limb starts blocking the view from the front porch. A scrub of growth pushes against the power drop coming off the pole. By that point, the trim has gone from routine maintenance to a small emergency — and small emergencies in Northwest Florida have a way of turning into big ones the moment a tropical system shows up offshore.\n\nTree trimming is the kind of service that pays for itself many times over because it prevents the calls that cost real money. Cutting back overgrowth, clearing limbs away from structures, and opening up canopies to let more light reach your yard are all simple operations on a sunny Tuesday — and very expensive operations after a tree has already gone through a roof. Regular trimming on a healthy 18- to 24-month cycle keeps your trees structurally sound and your property safer year-round.",
        },
        {
          heading: "What 'Trimming' Actually Means On Our Trucks",
          content:
            "Tree trimming is often confused with pruning, but on our service catalog they're two different jobs. Trimming is primarily about shape, clearance, and safety: removing limbs that overhang the roof, blocking sightlines from the driveway, brushing the siding, or growing into utility lines. It's the service most residential customers actually need a couple of times a year.\n\nWe approach trimming with a few rules our crew never breaks. We don't 'top' trees — that's the practice of lopping off the upper canopy, and it permanently weakens the tree by forcing weak, fast-growing watersprouts. We don't strip every interior branch off a live oak just to make it 'look cleaner' — that exposes the tree to sunscald and stress. We use clean, sharp cuts at the branch collar so the wound seals naturally. And we work from the ground up with a plan, not from the top down with a chainsaw and a hope.",
        },
        {
          heading: "Prevent Storm Damage Before The Forecast Shows Up",
          content:
            "Regular tree trimming directly reduces hurricane and tropical storm damage. Wind moves through a properly thinned canopy instead of pushing against a solid wall of leaves and branches. Limbs that are trimmed back from the house can't be turned into battering rams when winds hit 60+ mph. Dead wood in the canopy — which is the first thing to break loose in a storm — is identified and removed before it becomes a missile.\n\nFor anyone living between Pensacola and Panama City, this isn't an abstract concern. The Emerald Coast sees enough tropical activity that 'storm-ready' is a basic part of property ownership, not an extra. We've responded to enough post-storm calls in Niceville, Destin, and Fort Walton Beach to tell you confidently that the trees that survive intact are almost always the ones that were maintained in the year or two before the storm.",
        },
        {
          heading: "What A Trimming Visit Looks Like",
          content:
            "When you book a trimming visit, the first thing we'll do is walk the property with you and confirm the scope. We'll point out specific limbs we recommend cutting and why, flag any dead wood, and let you know if anything we see on the property suggests a deeper issue — disease, root damage, structural cracks. You'll know exactly what we're going to cut before we start.\n\nThe work itself is usually a half-day to a full day depending on the number and size of trees. We chip brush on-site, haul out anything that won't fit through a chipper, and clean every surface our crew touched — driveway, walkway, patio, lawn. By the time the truck pulls out of the driveway, the only sign we were there is a healthier-looking, better-balanced canopy and a lawn you can mow without ducking.",
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
      metaTitle="Tree Pruning Niceville FL | IGY6 Rooted"
      metaDescription="Expert tree pruning in Northwest Florida. Remove dead and diseased branches, extend tree life, improve structure. Free estimates — (518) 265-0275."
      ogImage="/og/tree-pruning.jpg"
      serviceKeyword="Tree Pruning"
      heroText="Specialized care that targets the health of your trees — remove disease, improve circulation, and strengthen growth."
      heroImage={heroOption3}
      heroImageAlt="Healthy mature oak tree above a striped, professionally maintained lawn"
      midImage={heroOption2}
      midImageAlt="Lush green Bermuda lawn beneath properly pruned pine and oak trees"
      midImageCaption="Pruning improves long-term tree health — well-pruned trees live longer and look better."
      sections={[
        {
          heading: "Pruning Is About Long-Term Tree Health",
          content:
            "Tree pruning is specialized work that targets the long-term health of your trees rather than their short-term appearance. The goal of a pruning visit isn't to make the tree look smaller or tidier — it's to remove the dead, diseased, damaged, and structurally weak wood that, if left in place, will eventually cost the tree its life or your property its safety. Done properly on a regular cycle, pruning can extend the healthy lifespan of a residential shade tree by twenty years or more.\n\nIn Northwest Florida, pruning matters even more than it does in cooler climates because our humidity, our heat, and our growing season create ideal conditions for fungal diseases, pests, and structural decay. A live oak that goes a decade without proper pruning will accumulate dead wood in the upper canopy that becomes a habitat for carpenter ants and a launching point for storm damage. A pine with crossing or rubbing branches in the interior will develop bark wounds that invite pine bark beetles. None of these problems show up overnight — they build slowly, and they're almost entirely preventable with proactive care.",
        },
        {
          heading: "More Than Just Cutting Branches",
          content:
            "Proper pruning is a discipline. Each cut is intentional, made at a specific point on the branch — typically just outside the branch collar, never flush to the trunk and never leaving a stub — so the tree can seal the wound naturally and resist infection. We remove dead, diseased, and damaged branches first; then we identify crossing branches that rub each other and create entry points for decay; then we thin selectively to improve air circulation through the canopy; and finally we make any structural cuts needed to encourage strong, well-balanced growth going forward.\n\nWe also pay attention to how much we're taking off. As a rule, we don't remove more than 25% of a tree's live canopy in a single visit on a mature tree, and considerably less on a stressed one. Aggressive pruning sounds productive but it stresses the tree and forces a flush of weak, fast-growing water sprouts that defeat the entire purpose of the work. Conservative, well-targeted pruning on a regular schedule is always the better long-term answer.",
        },
        {
          heading: "Pruning vs. Trimming — How To Tell What You Need",
          content:
            "Trimming is primarily about shape and immediate clearance — moving a limb away from the roof, opening up a sightline, cleaning up the silhouette of a tree. Pruning is primarily about long-term health — removing dead wood, addressing disease, and shaping growth so the tree develops strong structure over years and decades. Both services help your trees grow stronger while protecting your property investment, but they answer different questions.\n\nIf your tree looks generally healthy but is overgrown or in the way, trimming is probably the right call. If your tree has dead branches, areas with sparse leaf coverage, signs of disease (cankers, oozing, fungal growth), or structurally questionable forks, pruning is what you need. Many of our visits include both — we'll start with health-driven pruning and then do shape-driven trimming as part of the same job. Either way, you get a clear scope before we start.",
        },
        {
          heading: "When To Schedule Pruning",
          content:
            "Most species in our area do best with pruning during the dormant or near-dormant late winter window (December through early February in Northwest Florida), because the lack of leaves makes structural issues easier to see and the tree's energy reserves are protected. That said, dead and damaged wood can — and should — be removed any time of year, regardless of the calendar. Storm-related cleanup is also year-round.\n\nNot sure what your trees need? We offer free, no-pressure estimates and a written assessment of your specific situation. We'll walk the property, identify trees that would genuinely benefit from pruning, and tell you honestly when waiting another season is fine. Many of our customers schedule pruning on a 2-3 year rotation per tree — frequent enough to keep ahead of structural issues, infrequent enough that it doesn't feel like a constant expense.",
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
      metaTitle="Stump Grinding Niceville & Destin FL | IGY6 Rooted"
      metaDescription="Professional stump grinding in Niceville, Destin & Fort Walton Beach. Grind below grade for a clean, level yard. Free estimates — (518) 265-0275."
      ogImage="/og/stump-grinding.jpg"
      serviceKeyword="Stump Grinding"
      heroText="Our specialty — grind stumps below ground level for a clean, flat, usable yard."
      heroImage={serviceSecondary}
      heroImageAlt="Manicured residential lawn with a mulched ring where a tree was professionally removed"
      midImage={heroMain}
      midImageAlt="Beautifully manicured lawn after stump grinding and full cleanup"
      midImageCaption="A few weeks after grinding, the area blends right back into the lawn — exactly the goal."
      sections={[
        {
          heading: "Get Rid Of Ugly Stumps For Good",
          content:
            "Old tree stumps aren't just eyesores — they're functional problems. They attract termites and carpenter ants that can eventually move from the stump into your home's framing. They sprout suckers and weed growth that's nearly impossible to control with a regular mower. They become tripping hazards in lawns, especially for kids, dogs, and anyone running a string trimmer. They damage mower decks and blades when you forget exactly where they are. And they take up real estate in your yard that could otherwise be lawn, garden, or landscape.\n\nStump grinding is the cleanest, fastest, and most economical way to deal with all of those problems at once. Unlike chemical stump killers (which take a year or more and rarely work fully) or full stump excavation (which destroys a huge area of surrounding lawn and irrigation), grinding mechanically chips the stump and the structural roots down to several inches below grade. The result is a clean, level area that can be backfilled with topsoil and seeded, sodded, or mulched within days.",
        },
        {
          heading: "How Our Grinding Process Works",
          content:
            "We use professional-grade stump grinders that can handle stumps of any size, from small ornamental tree stumps in tight courtyards to massive hardwood stumps on open acreage. Our standard grind takes the stump to roughly 6-8 inches below grade — enough depth to plant new sod, lay irrigation, or pour a small slab over the area without root regrowth. For deeper applications (foundations, driveways, drainage work), we can grind further on request.\n\nThe process itself is faster than most people expect. A mid-sized stump (12-18 inch diameter) is typically a 30-60 minute operation. Larger stumps and clusters take longer, but a single visit handles almost every residential project. We bring tarps and protective barriers to keep wood chips contained, especially around windows, vehicles, and adjacent landscaping. When the grinding is done, we clean up the surface chips, leave a small amount of grindings as backfill (which composts naturally and feeds the soil), and haul away anything you don't want left behind.",
        },
        {
          heading: "Clean Results, No Damage To Your Yard",
          content:
            "What sets IGY6 Rooted apart on stump grinding specifically is our commitment to leaving the surrounding yard intact. A lot of stump grinding crews show up, drive heavy equipment across the lawn, dig a hole, and leave you with ruts and a mess. We come prepared with low-impact tracked machines for tight access, plywood matting for sensitive turf, and crews who actually care whether your lawn looks like a lawn when we leave.\n\nWe carefully grind each stump to the appropriate depth, clean up all surface debris, and leave the area ready for grass seed, sod, or landscaping. We protect surrounding turf, garden beds, irrigation heads, and hardscape throughout the entire process — no ruts, no torn-up sprinkler lines, no smashed walkway pavers. If a job requires us to drive over a sensitive area, we'll tell you up front and use matting; if a job requires partial hand-finish work near a flower bed, we do it.",
        },
        {
          heading: "What To Do With The Area After Grinding",
          content:
            "Most homeowners want to know what to plant in the spot after grinding. The short answer is: anything, with one caveat. Wood grindings will continue composting for several months and will temporarily tie up nitrogen in the soil as they break down. If you want to seed or sod immediately, we recommend hauling away the bulk of the grindings, backfilling with clean topsoil, and adding a balanced starter fertilizer. If you can wait a season, leaving the grindings in place is fine — they'll naturally compost and the area will be plantable by the next growing season.\n\nIf you're planning to plant a new tree in the same general area, give the spot at least a few feet of offset from the original trunk location, since the remaining root mass below grade can interfere with new root development. We're happy to walk through your post-grind plans during the estimate and make recommendations specific to your soil, sun exposure, and irrigation setup.",
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
      metaTitle="24/7 Emergency Tree Removal in Niceville, FL | IGY6 Rooted"
      metaDescription="24/7 emergency tree removal in Northwest Florida. Storm damage, fallen trees, urgent hazards. Call (518) 265-0275 for immediate response."
      ogImage="/og/emergency.jpg"
      serviceKeyword="Emergency Tree Removal"
      heroText="24/7 rapid response for fallen trees, storm damage, and urgent safety hazards. Don't wait — call us immediately."
      heroImage={heroOption2}
      heroImageAlt="Tall mature pines and oaks in a Northwest Florida backyard following a storm"
      midImage={serviceSecondary}
      midImageAlt="Cleared and restored residential lawn following emergency tree removal"
      midImageCaption="After an emergency call, our goal is to get your property safe and back to normal as fast as possible."
      sections={[
        {
          heading: "When Every Minute Counts",
          content:
            "Some tree removals can wait a week. Others can't wait an hour. A tree that has partially fallen onto a home, a limb that's hung up on a power line, a trunk that has split and is now leaning toward a bedroom window — these are situations where the next gust of wind, the next rain band, or the next vibration from a passing truck can turn a manageable problem into a catastrophic one. Many homeowners don't realize how quickly partially fallen trees can shift and fall unexpectedly. By the time it's obviously dangerous, it's already too late to be standing under it.\n\nAt IGY6 Rooted, we take emergency tree removals very seriously and we prioritize them above all other scheduled work. After you reach out, we'll assess any immediate risks over the phone, give you safety instructions for the area around the tree, and dispatch a crew as quickly as possible. For active structural threats, that's often within hours — even outside of normal business hours, even on weekends, even during active tropical weather.",
        },
        {
          heading: "Common Emergency Situations We Respond To",
          content:
            "A tree has fallen across your driveway and you can't get a vehicle in or out. A tree is leaning dangerously close to power lines after a storm and the utility hasn't arrived yet. A trunk has split and is unstable, leaning toward your home, a vehicle, or a play area. A large limb is hung up in the canopy after a storm and could drop at any moment. Roots have lifted out of the ground on one side of a tree, and the entire root flare is visible — a strong indicator the tree is about to come down.\n\nThese are exactly the calls we drop everything for. You don't want to hesitate if you have a tree emergency. Even if you're not sure whether it qualifies as urgent, it's better to be safe than sorry. Call us immediately — even outside of normal business hours, and even if you're calling at 2 a.m. during a tropical storm. We'd rather get a call that turns out to be non-urgent than miss a call where waiting until morning would have made the situation worse.",
        },
        {
          heading: "Storm Season Response In Northwest Florida",
          content:
            "Hurricane and tropical storm activity along the Emerald Coast routinely creates a spike in emergency tree work for several days after a system passes through. We staff up before forecasted weather, stage equipment in central locations across Okaloosa and Walton counties, and pre-coordinate with local crews so we can move fast as soon as conditions allow safe work. We work closely with insurance adjusters when needed and can provide written documentation of damage, work performed, and disposal — all of which makes claims dramatically easier.\n\nIn the immediate aftermath of a major storm, demand can outstrip any one company's capacity. We triage based on immediate danger to life and structures first, then access issues, then property cleanup. If you call during a high-volume window, we'll give you an honest ETA. We won't promise a same-day response if we can't deliver it, but we will keep you informed.",
        },
        {
          heading: "Safety Steps To Take Before We Arrive",
          content:
            "If a tree has fallen on or near your home, evacuate the affected area and stay away from any sagging ceilings or visible structural damage inside. If power lines are involved, assume every wire is live and call the utility immediately — we cannot work around energized lines until the utility de-energizes them. Keep children and pets well away from the work zone. If you can do so safely, take photos of the damage from multiple angles for your insurance claim before any cleanup begins.\n\nDon't try to remove or cut storm-damaged trees yourself. Tension in a leaning trunk or a hung-up limb is invisible from the ground, and a wrong cut can release that tension explosively. The vast majority of serious chainsaw injuries we see in news reports happen during DIY storm cleanup. Our crews train specifically for this work — leave it to us, and let us get your property back to safe as quickly as possible.",
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
      title="Debris Removal & Storm Cleanup"
      metaTitle="Storm Debris Removal Niceville, Destin & Fort Walton FL"
      metaDescription="Fast yard debris and storm cleanup across Niceville, Destin, Fort Walton Beach & Crestview. Branch hauling, full property cleanup, post-hurricane response. Call (518) 265-0275."
      ogImage="/og/debris-removal.jpg"
      serviceKeyword="Debris Removal & Storm Cleanup"
      heroText="Branches down, limbs piled up, post-storm mess across the yard? We haul it all — fast, complete, and on the schedule the city can't match."
      heroImage={heroOption2}
      heroImageAlt="Northwest Florida residential property with mature trees and clean lawn after debris cleanup"
      midImage={heroOption1}
      midImageAlt="Tidy Niceville home with mature oaks and clean front yard after professional debris removal"
      midImageCaption="A clean property after debris removal — exactly how every job should end."
      sections={[
        {
          heading: "Storm Debris & Yard Waste Removal — Done in One Visit",
          content:
            "There's a common scenario along the Emerald Coast that every Niceville, Destin, and Fort Walton Beach homeowner recognizes: a storm rolls through, the wind dies down, and suddenly the yard is unrecognizable. Branches, leaves, palm fronds, snapped limbs, and small downed trees cover the lawn, the driveway, and the flower beds. Even a moderate Florida thunderstorm can drop hundreds of pounds of organic material on an average residential lot. A real tropical system or hurricane can produce more debris than a typical pickup truck can haul in a dozen trips.\n\nDebris removal is one of those services that sounds simple until you actually try to do it yourself. Branches are heavier than they look, leaf piles compact into wet, dense mats, and Okaloosa County, Walton County, and the City of Destin all have strict rules about what can go in yard waste containers and how it must be cut and bundled. We bring the right equipment — chippers, dump trailers, loaders for larger jobs — to handle debris of any size, from small post-storm branch piles to entire trees worth of material. One visit, one truck out, one clean property.",
        },
        {
          heading: "When To Call Us For Debris Removal",
          content:
            "After a storm is the obvious case, but it's far from the only one. Property owners across Northwest Florida call us for debris removal after their own DIY tree work (a branch that came down harder than planned, a hedge trim that produced more material than expected), after construction or remodeling that left a yard full of cleared vegetation, after a long-vacant property changes hands and needs to be cleaned up before listing, and as part of routine seasonal cleanups for landlords, HOAs, and commercial property managers in Bluewater Bay, Valparaiso, Crestview, and Navarre.\n\nWe also handle debris removal as a standalone service for customers who used another tree company that didn't complete the cleanup. That happens more often than people realize — a removal crew finishes the actual cutting, then leaves piles of brush and rounds for the homeowner to deal with. We're happy to come in behind another crew and finish the job properly. If you've already scheduled a tree job with us, complete debris cleanup is included by default — no extra trip, no extra invoice.",
        },
        {
          heading: "Hurricane & Tropical Storm Cleanup On The Emerald Coast",
          content:
            "Northwest Florida's storm season can leave your property covered in fallen branches, leaves, and tree debris for weeks if you wait on municipal pickup. Local yard waste collection typically runs slow after a major weather event — the sheer volume of debris across Okaloosa, Walton, and Santa Rosa counties overwhelms normal pickup schedules, and your pile of branches at the curb can sit for a month before it's collected. We provide fast, efficient post-hurricane cleanup so you can get back to normal as quickly as possible, without waiting on the city or county.\n\nFor major storm cleanup, we can dispatch larger equipment and crews to handle multiple acres in a day. We chip what we can on-site (which dramatically reduces hauling volume and cost), load larger material directly into our trailers, and dispose of everything at proper municipal or commercial composting facilities. We do not dump debris on adjacent vacant lots, in the woods, or anywhere else it shouldn't be — every load is tracked from your property to a legitimate disposal site. If your insurance adjuster needs documentation of work performed and material hauled, we can provide written records on request.",
        },
        {
          heading: "What's Included In Every Debris Removal Visit",
          content:
            "Every debris removal job we run is end-to-end. We rake the affected areas (not just the obvious piles), blow off your driveway, walkway, and patio, pick up small wood and bark fragments by hand where needed, and load every bit of material we generated into our trucks before we leave. If we cut something, we haul it. If we agreed to remove an existing pile, we remove all of it — not just the easy pieces on top.\n\nWe also handle the non-yard parts that often get ignored: cleaning out clogged gutters of pine needles after a heavy storm, raking leaves out of pool screens and equipment areas, and cleaning debris off flat roofs where it's safe to do so. Tell us what you need cleaned up and we'll scope it; the goal is for your property to look better when we leave than it did before the storm. For ongoing peace of mind, ask about pairing debris removal with regular {' '}<a className=\"underline hover:no-underline\" href=\"/services/tree-trimming\">tree trimming</a> visits — it's the cheapest insurance against the next storm.",
        },
        {
          heading: "Pricing, Timing & How To Book",
          content:
            "Debris removal pricing depends on volume, accessibility, and how much processing the material needs before it can be loaded. A small pile of clean branches in an accessible Niceville front yard is a quick, low-cost visit — often under an hour on-site. An acre of post-hurricane mixed debris with full trees down across fences and outbuildings in Crestview is a multi-day project with multiple crews and equipment. We give you an honest estimate after seeing the property, and we don't add surprise charges later.\n\nFor non-emergency cleanups we typically schedule within 5-7 business days. For active storm response we triage by safety risk first and reach the worst situations within 24-48 hours when conditions allow. Call (518) 265-0275 for a free estimate, or use our online booking form. If your situation involves a fallen tree blocking access or threatening a structure, you actually want our {' '}<a className=\"underline hover:no-underline\" href=\"/services/emergency-tree-removal\">emergency tree removal</a> line — debris removal picks up where that work ends.",
        },
      ]}
      benefits={[
        "Same- or next-week scheduling for non-emergencies",
        "Hurricane response with extra crews on standby",
        "Insurance-ready documentation on request",
        "On-site chipping reduces cost",
        "Disposal at licensed composting facilities only",
        "Veteran-owned & fully insured",
      ]}
      relatedServices={[
        { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal" },
        { name: "Brush Removal", href: "/services/brush-removal" },
        { name: "Lot Clearing", href: "/services/lot-clearing" },
        { name: "Tree Trimming", href: "/services/tree-trimming" },
        { name: "Property Maintenance", href: "/services/property-maintenance" },
      ]}
    />
  );
}

export function LandscapingPage() {
  return (
    <ServicePageTemplate
      title="Landscaping"
      metaTitle="Landscaping Niceville & Destin FL | IGY6 Rooted"
      metaDescription="Florida-friendly landscaping in Northwest Florida: beds, sod, mulch, planting, and curb-appeal renovation. Free estimates — (518) 265-0275."
      ogImage="/og/landscaping.jpg"
      serviceKeyword="Landscaping"
      heroText="Transform your outdoor spaces with professional landscaping design and installation."
      heroImage={heroOption4}
      heroImageAlt="White Florida coastal home with lush landscaping, palms, and crisp green hedges"
      midImage={heroMain}
      midImageAlt="Manicured residential lawn with healthy trees and clean landscaping"
      midImageCaption="Good landscaping starts with a healthy lawn and well-placed trees — the rest builds on that."
      sections={[
        {
          heading: "Beautify Your Property — Beyond Tree Work",
          content:
            "Beyond tree services, IGY6 Rooted offers landscaping to help you create the outdoor space you've always wanted. For a lot of our customers, landscaping is the natural next step after tree work — once the dead pine is gone, the stump is ground, and the area is cleared, there's a fresh canvas in the yard that calls for thoughtful planting, mulching, and bed work to bring it back to life. We bring the same military precision and attention to detail to landscaping that we bring to every tree job.\n\nLandscaping is also a service we offer on its own, fully independent of any tree work. Whether you've just bought a home with tired beds, you're tired of paying for an unreliable lawn crew, or you're getting a property ready to sell and want a fast curb-appeal upgrade, we can scope a project that fits your budget and your timeline. We don't push high-end designs on customers who just want a clean, low-maintenance yard, and we don't cut corners on customers who want a showpiece.",
        },
        {
          heading: "What Our Landscaping Services Include",
          content:
            "Common landscaping services we provide include new bed installation and edging, sod installation and lawn renovation, mulch refresh and bed cleanup, ornamental tree and shrub planting, palm planting and replacement, simple hardscape work like stepping stones and stone borders, irrigation tune-ups and minor repairs, and seasonal cleanups for properties that need a refresh between professional visits. Most projects combine several of these services into a single coordinated visit.\n\nWe work with Florida-friendly plants and materials suited to the Emerald Coast climate. Heat tolerance, salt tolerance (especially for properties closer to the coast), water use, and pest resistance all factor into our recommendations. There's a long list of plants that look great in a nursery in March but die in a Niceville yard by August — we steer customers toward plants that will actually thrive on your property, not plants that just look good on the day they're installed.",
        },
        {
          heading: "Coordinated With Tree Care",
          content:
            "One of the advantages of using us for both tree work and landscaping is that the two services get coordinated properly. When we know we're planting new beds in a few weeks, we'll trim the existing canopy to let in the right amount of light for the new plants. When we're removing a tree, we already know whether you want sod, beds, or a new ornamental in the cleared spot, so we can plan for it during cleanup. Most customers who try to coordinate this between two separate companies — one for trees, one for landscaping — end up with avoidable extra trips and frustrating mismatches.\n\nWe also handle the realities of working around mature root systems, irrigation, drainage, and existing hardscape. A lot of failed landscaping projects fail not because the design was bad, but because nobody accounted for what was already in the ground. We dig carefully, mark utilities and irrigation before any excavation, and adjust the plan in real time when the ground tells us something we didn't expect.",
        },
        {
          heading: "How To Get Started",
          content:
            "Most landscaping projects start with a free on-site visit. We'll walk the property with you, talk through what you want the space to do (entertain, look great from the street, give the kids a play area, support a pool, attract pollinators, frame a view), and put together a written scope and estimate. For larger projects, we can also produce simple sketches and material lists so you can see the plan before signing off.\n\nWe don't require a giant retainer or a multi-year contract — most residential landscaping work is paid in two stages, with a deposit at the start and the balance on completion. We're transparent about pricing, conservative about timelines, and we'd rather under-promise and over-deliver than the other way around. Give us a call when you're ready, and we'll come take a look.",
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
      metaTitle="Land Clearing Niceville & Crestview FL | IGY6 Rooted"
      metaDescription="Land clearing for builders and homeowners across Okaloosa & Walton County. Selective or full clearing, forestry mulching, hauling. Free estimates — (518) 265-0275."
      ogImage="/og/land-clearing.jpg"
      serviceKeyword="Land Clearing"
      heroText="Prepare your property for construction, development, or a fresh start with professional land clearing."
      heroImage={heroOption2}
      heroImageAlt="Open Northwest Florida property with mature trees ready for selective land clearing"
      midImage={serviceSecondary}
      midImageAlt="Cleared residential land with smooth grass surface ready for construction or use"
      midImageCaption="A finished clearing job leaves a clean, usable surface ready for the next phase."
      sections={[
        {
          heading: "Clear The Way For Your Project",
          content:
            "Land clearing is a fundamentally different service from tree removal. A tree removal job is one tree (or a handful) on a property that already has a finished landscape around it. Land clearing is the systematic removal of vegetation across an entire site — usually because that site is being prepared for new construction, a building pad, a driveway extension, agricultural use, or simply being reclaimed from years of overgrowth. The equipment, the planning, and the cost structure are all different.\n\nWhether you're preparing for new construction in Crestview, building a pole barn in Baker, creating a building pad on raw acreage in Walton County, or converting an overgrown lot into usable space behind a Niceville home, our land clearing service removes all vegetation, stumps, and debris efficiently and thoroughly. We work directly with builders, general contractors, and homeowner-developers — we know what construction crews need from a cleared site, and we deliver it.",
        },
        {
          heading: "Equipment And Expertise For Real Acreage",
          content:
            "We bring the right heavy equipment for the job. For smaller residential clearings (under an acre), tracked skid steers with mulching heads can handle most jobs without leaving deep ruts or compaction issues. For larger projects, we coordinate excavators, brush cutters, and forestry mulchers as needed. We don't subcontract the actual work to crews you've never met — every job is staffed and supervised by our team.\n\nWe also handle the parts of land clearing most people don't think about: identifying property lines and avoiding encroachment, locating and protecting utilities, complying with local stormwater and erosion control requirements during the work, and disposing of cleared material legally. Forestry mulching (where vegetation is ground in place into a mulch layer) is often a faster and cheaper alternative to traditional clearing because it eliminates haul-off costs, but it isn't the right answer for every site. We'll tell you which method makes sense for your project.",
        },
        {
          heading: "Selective Clearing Vs. Full Clearing",
          content:
            "Not every clearing job means stripping the property bare. In fact, on most residential and rural properties, selective clearing — keeping mature shade trees, attractive hardwoods, and any vegetation that adds value, while removing scrub, invasive species, dead wood, and anything in the build path — produces a far better long-term result than a full strip-and-grade. A wooded lot with the right trees preserved is worth more, looks better, and is more comfortable to live on than the same lot scraped clean.\n\nWe walk every clearing job with the property owner before any equipment moves. You tell us what you want to keep; we flag the trees, mark the boundaries of the work zone, and confirm the plan in writing before we start. We've seen too many sites where a misunderstanding turned into 'the bulldozer took the wrong trees' — and that's not a mistake you can undo.",
        },
        {
          heading: "Permits, Stormwater, And Site Compliance",
          content:
            "Land clearing in Northwest Florida often triggers permitting requirements that don't apply to single-tree removal. Wetland buffers, stormwater management rules, protected species considerations, and county-specific land disturbance permits can all come into play depending on the size and location of the project. We're familiar with the rules in Okaloosa, Walton, Santa Rosa, and Escambia counties, and we'll let you know up front what permits or approvals are likely to be needed for your project.\n\nWe can also work directly with your builder, surveyor, or civil engineer to make sure the cleared site matches the plans they've drawn. If your project requires a specific finished elevation, drainage swale, or building pad footprint, we coordinate with the next trade up the chain so the clearing work feeds directly into construction without rework. The goal is always to deliver a site that's actually ready for the next step — not just one that looks cleared.",
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
      metaTitle="Lot Clearing Niceville & Destin FL | IGY6 Rooted"
      metaDescription="Build-ready lot clearing for residential and commercial sites in Northwest Florida. Trees, stumps, brush, debris removed. Free estimates — (518) 265-0275."
      ogImage="/og/lot-clearing.jpg"
      serviceKeyword="Lot Clearing"
      heroText="Complete lot preparation including vegetation, stumps, and debris removal for residential and commercial properties."
      heroImage={heroOption2}
      heroImageAlt="Wooded Northwest Florida lot ready for residential or commercial lot clearing"
      midImage={serviceSecondary}
      midImageAlt="Cleared and graded residential lot ready to build on"
      midImageCaption="A properly cleared lot is the difference between a smooth build and a six-week delay."
      sections={[
        {
          heading: "Ready-To-Build Lots, Done Right",
          content:
            "Our lot clearing service covers everything needed to take a property from overgrown to construction-ready. We remove all trees, stumps, brush, and debris, leaving you with a clean, level surface that your builder, your foundation crew, and your inspectors can actually work with. The difference between a cleared lot and a build-ready lot is real — and we deliver the second one.\n\nFor residential infill lots in established neighborhoods like Bluewater Bay or Mary Esther, the challenge is usually working in tight quarters without damaging neighboring properties, sidewalks, or utilities. For new development lots in greenfield areas, the challenge is volume — handling many acres of mixed vegetation efficiently while staying ahead of any grading or stormwater work that follows. We staff and equip each job to match the actual conditions, not a generic template.",
        },
        {
          heading: "Residential And Commercial Lot Work",
          content:
            "We work on single-home lots for individual homeowners and owner-builders, multi-lot residential subdivisions for developers, commercial parcels for retail, restaurant, and small office construction, agricultural land conversions, and remediation work on neglected or vacant lots. Whether it's a single-home lot or a larger commercial property, we scale our equipment and crew to match the job. A 0.3-acre infill lot might take a single morning; a 5-acre commercial pad might take a week. We give you a realistic timeline up front and stick to it.\n\nWe coordinate with general contractors, civil engineers, surveyors, and code officials as needed. If your project requires staged clearing (clear part of the site for a model home while preserving lots that aren't ready to build yet), we plan the work in phases. If your project requires preserving specific trees per HOA, county, or design requirements, we mark and protect them before any equipment starts. The goal is always to deliver exactly the cleared site your project actually needs.",
        },
        {
          heading: "Stump Removal And Final Grade",
          content:
            "A common mistake on lot clearing projects is leaving stumps in the ground after the trees come down. Stumps that aren't ground or pulled out will rot in place over years and create voids under your slab, your driveway, or your finished landscape — voids that show up as settlement cracks down the road. Every lot clearing project we run includes a clear plan for stumps: ground in place to the appropriate depth, pulled out and hauled off, or in some cases buried in spoil areas if the build plan allows it.\n\nFinal surface grade is also part of the scope. We don't leave a cleared lot looking like a war zone — we smooth the surface, address any obvious drainage issues, and hand off a site that's ready for the next trade. If your builder or excavator wants to handle final grade and pad prep themselves, that's fine too; we'll coordinate the handoff so you're not paying for overlapping work.",
        },
        {
          heading: "Cost, Timeline, And What To Expect",
          content:
            "Lot clearing costs vary widely based on lot size, vegetation density, hauling distance, stump count, and any environmental constraints. A clean wooded lot with mostly pine and easy access is significantly cheaper per acre than a lot with dense hardwood, large stumps, and tight equipment access. We give written estimates that break out clearing, stump work, hauling, and any optional services (mulching in place vs. haul-off, final grade, erosion control) so you can make informed decisions.\n\nMost residential lot clearing projects can be completed within 2-5 working days from mobilization to final cleanup, weather permitting. Larger commercial projects run longer and we'll coordinate the schedule with your overall construction timeline. We work efficiently to minimize disruption to neighbors and adjacent properties, and we communicate proactively if anything on-site changes the plan.",
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
      metaTitle="Brush Removal Niceville & Crestview FL | IGY6 Rooted"
      metaDescription="Overgrown brush, vines, and underbrush cleared across Northwest Florida. Fire safety, defensible space, curb appeal. Free estimates — (518) 265-0275."
      ogImage="/og/brush-removal.jpg"
      serviceKeyword="Brush Removal"
      heroText="Clear overgrown brush and undergrowth for fire safety, aesthetics, and usable outdoor space."
      heroImage={heroOption2}
      heroImageAlt="Overgrown brush along a wooded Northwest Florida property line"
      midImage={heroOption1}
      midImageAlt="Clean, tidy yard after professional brush removal in Northwest Florida"
      midImageCaption="The same property after brush removal — usable, safe, and easier to maintain."
      sections={[
        {
          heading: "Take Back Your Property",
          content:
            "Overgrown brush is one of the most under-rated problems on a residential property. It's not as dramatic as a fallen tree, so it's easy to put off — until it isn't. Dense brush creates fire hazards, especially in dry seasons. It harbors snakes, rodents, ticks, and mosquitoes. It hides drainage issues, fence damage, and erosion until those problems become expensive. It makes large parts of your property unusable for play, parking, gardening, or even basic walking access. And from the street, an overgrown property line tells everyone — including potential buyers and would-be intruders — that the property isn't actively maintained.\n\nOur brush removal service clears away dense undergrowth, vines, and small trees to restore your land to a usable, attractive state. We handle the work that's too small for a full land clearing project but too large for a homeowner with a string trimmer and a Saturday afternoon. Most brush removal jobs are completed in a single visit and produce immediate, dramatic before-and-after results.",
        },
        {
          heading: "What 'Brush' Includes And How We Handle It",
          content:
            "When we say brush, we mean the messy mix of vegetation that builds up in untended areas: greenbriar and other thorny vines, wax myrtle and yaupon holly thickets, palmetto, scrub oaks, fast-growing pines under 4-6 inches in diameter, and the general tangle of weeds, saplings, and dead material that fills the spaces between mature trees. Most overgrown brush situations are a combination of all of these, layered on top of each other across years of growth.\n\nWe handle brush removal with a combination of brush cutters, chainsaws for larger material, hand work in sensitive areas, and chippers or hauling for the cleared material. On larger jobs, forestry mulching (grinding the brush in place into a mulch layer) is often the fastest and most cost-effective approach. For brush along fence lines, around structures, or near landscaping, we shift to careful manual work to avoid damage to anything we're not removing.",
        },
        {
          heading: "Fire Prevention And Property Value",
          content:
            "In Florida's dry seasons, overgrown brush is a serious fire risk. Wildfires across Northwest Florida have destroyed homes that would have been spared if the surrounding 30-50 feet of property had been kept clear of dense, dry vegetation. The Florida Forest Service strongly recommends defensible space around residential structures, and brush removal is the most direct way to create it. For homeowners in wooded areas of Niceville, Bluewater Bay, Crestview, and Walton County, this is genuinely a safety service — not just an aesthetic one.\n\nRegular brush clearing also boosts your property value and curb appeal in measurable ways. Real estate agents will tell you that an overgrown property loses interest from buyers within the first 30 seconds of a drive-by, even if the home itself is excellent. A clean, well-maintained perimeter signals that the entire property has been cared for. We handle everything from small backyard areas to large acreage, and we can set up recurring visits for properties that need ongoing maintenance.",
        },
        {
          heading: "One-Time Or Recurring Service",
          content:
            "Some customers call us for a one-time reset — the property has gotten away from them, they want it cleaned up, and they'll handle ongoing maintenance themselves. Others want recurring service: a thorough brush clearing once or twice a year as part of a maintenance program. Both are common, and we're happy to do either.\n\nFor recurring customers, we put the visit on the calendar, show up without you needing to call, and keep the property at a consistent baseline year-round. For one-time jobs, we focus on getting maximum impact from a single visit — clearing the highest-value areas first (fence lines, driveways, around structures, defensible space around the home) and then working outward. Either way, you get a clear scope, an honest estimate, and a property that actually looks and feels different when we're done.",
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
