// Long-form pillar articles linked from the homepage service cards.
// Each article expands on the "Did you know" fact shown on its card.
// Kept as a static data file so updates don't require a DB migration.

import treeRemoval from "@/assets/services/client/emergency-tree-service.png";
import stumpGrinding from "@/assets/services/client/stump-grinding-1.jpg";
import bucketLiftTrim from "@/assets/services/client/bucket-lift-trim.jpg";
import treePruning from "@/assets/services/client/tree-pruning.jpg";
import emergencyRemoval from "@/assets/services/client/emergency-removal.jpg";
import climberPine from "@/assets/services/client/climber-pine.jpg";
import bucketLiftHouse from "@/assets/services/client/bucket-lift-house.jpg";
import hazardAssessment from "@/assets/services/client/hazard-assessment.jpg";
import skidSteer from "@/assets/services/client/skid-steer.jpg";
import landClearing from "@/assets/services/client/land-clearing.jpg";
import brushRemoval from "@/assets/services/client/brush-removal.jpg";
import debrisRemoval from "@/assets/services/client/debris-removal.jpg";
import fallenOakStorm from "@/assets/services/client/fallen-oak-storm-damage.png";

export type BlogSection = {
  heading: string;
  body: string;
};

export type BlogFAQ = {
  q: string;
  a: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  cardTitle: string; // matches the homepage card label
  fact: string; // the "Did you know" hook
  excerpt: string; // ~160-char meta description
  readMinutes: number;
  category: "Tree Care" | "Storm Prep" | "Property" | "Safety";
  image: string;
  imageAlt: string;
  intro: string;
  sections: BlogSection[];
  faqs: BlogFAQ[];
  cta: { headline: string; body: string };
  related: string[]; // slugs
};

export const BLOG_POSTS: BlogPost[] = [
  // 1
  {
    slug: "fallen-trees-insurance-claims",
    cardTitle: "Tree Removal",
    title: "Why Nearly 1 in 4 Property Claims Involve a Fallen Tree",
    fact: "Nearly 1 in 4 homeowner property damage claims involve a fallen tree.",
    excerpt:
      "Fallen trees drive a quarter of all U.S. property damage insurance claims. Here's why — and how to spot a hazard tree before it costs you.",
    readMinutes: 6,
    category: "Property",
    image: treeRemoval,
    imageAlt: "IGY6 Rooted crew safely removing a large hazardous tree",
    intro:
      "If you own a home long enough in the Southeast, odds are you'll deal with a tree on the wrong side of the ground. Insurance industry data has consistently shown that fallen-tree damage accounts for roughly a quarter of all homeowner property claims — making it one of the single most common causes of expensive home repairs in the country. The good news? Almost every tree that falls on a house gives off warning signs months (sometimes years) before it lets go. You just have to know what to look for.",
    sections: [
      {
        heading: "Why fallen-tree claims are so common",
        body: "Trees are essentially living towers — and like any tower, they fail when their structure becomes compromised. The combination of mature suburban canopies (most planted 40-80 years ago), increasingly volatile storm patterns, and the simple fact that wood eventually decays means that the average American street has more 'liability trees' than it did a generation ago. The Insurance Information Institute has tracked tree-related claims as one of the top homeowner loss categories for over a decade, and tree damage claims have steadily risen alongside the increased severity of named storms.",
      },
      {
        heading: "The five warning signs a tree is becoming a hazard",
        body: "1) Mushrooms or conks growing at the base — a sign of internal rot at the root collar.\n\n2) Deep cracks or seams running vertically up the trunk, especially after a freeze or hard wind.\n\n3) A noticeable lean that wasn't there a year ago, or fresh soil heaving on one side of the root plate.\n\n4) Dead branches larger than 2 inches in diameter in the upper canopy ('widow makers').\n\n5) Co-dominant stems with a tight V-shaped union — these often split during storms because the bark grows inward and weakens the joint.",
      },
      {
        heading: "What insurance actually covers (and what it doesn't)",
        body: "Most standard homeowner policies will pay to remove a tree that has fallen on a covered structure (house, garage, fence) — but coverage is usually capped at $500 to $1,000 per tree, and the limit applies whether one tree or twenty fell. Trees that fall in the yard without hitting a structure often aren't covered at all. And here's the kicker: if your insurer can prove the tree was visibly diseased or dead before it fell, they may deny the claim entirely under the 'neglect' exclusion. That's why a documented professional inspection matters.",
      },
      {
        heading: "Removal vs. preservation — when each makes sense",
        body: "Not every flagged tree needs to come down. A certified arborist can often save a tree with cabling, bracing, structural pruning, or root collar excavation. Removal becomes the right answer when: more than 50% of the canopy is dead, the trunk has significant cavities or rot, the lean is over 15 degrees with active root failure, or the tree is within striking distance of a primary structure and shows multiple defects. The cost of preventive removal is almost always a fraction of the cost of emergency removal plus repairs.",
      },
      {
        heading: "How to get a real assessment",
        body: "A proper hazard tree assessment isn't a 30-second glance from the curb. A trained arborist will walk the entire dripline, sound the trunk for cavities, check the root collar for fungal bodies, look at canopy density and deadwood ratio, and document any structural defects with photos. At IGY6 Rooted we offer free on-site assessments across Niceville, Destin, Fort Walton Beach, Crestview, and the surrounding Northwest Florida communities — because catching a problem tree early is the cheapest insurance you'll ever buy.",
      },
    ],
    faqs: [
      {
        q: "Will my insurance pay if a healthy tree falls on my house?",
        a: "Yes — most policies cover removal up to a per-tree cap (often $500-$1,000) plus the structural repairs. The deductible still applies, and limits vary by carrier.",
      },
      {
        q: "Do I need a permit to remove a hazardous tree in Florida?",
        a: "It depends on the city. Niceville, Destin, and unincorporated Okaloosa County have different rules for protected species like live oaks. We pull permits as part of every job that needs one.",
      },
      {
        q: "How much does professional tree removal cost?",
        a: "Most residential removals in Northwest Florida run between $400 and $2,500 depending on size, access, and proximity to structures. Hazardous emergency removals cost more. We give free written estimates.",
      },
    ],
    cta: {
      headline: "Worried about a tree on your property?",
      body: "Get a free hazard assessment from a veteran-owned local crew. We'll tell you straight whether it needs to come down — or whether it can be saved.",
    },
    related: ["hazard-tree-assessment-checklist", "hurricane-tree-debris-cleanup", "climbing-rigging-dangerous-jobs"],
  },

  // 2
  {
    slug: "stumps-attract-termites",
    cardTitle: "Stump Grinding",
    title: "Why Untreated Stumps Become Termite Highways to Your Home",
    fact: "Untreated stumps can attract termites within 6 months — and they often spread to nearby homes.",
    excerpt:
      "A leftover stump looks harmless. But within six months it can become a 24/7 buffet for the same termites that cause $5 billion in U.S. home damage every year.",
    readMinutes: 5,
    category: "Property",
    image: stumpGrinding,
    imageAlt: "Professional stump grinder eliminating a tree stump",
    intro:
      "When a tree comes down, most homeowners breathe a sigh of relief and forget about the stump. It's just a chunk of wood — what's the worst it can do? Quite a lot, actually. According to the National Pest Management Association, termites cause roughly $5 billion in property damage in the U.S. every year — more than fires, floods, and tornadoes combined. And one of the most reliable ways to invite them onto your property is to leave a fresh stump sitting in the yard.",
    sections: [
      {
        heading: "How fast a stump becomes termite habitat",
        body: "A freshly cut stump starts to decay almost immediately. As the wood softens and moisture builds up in the dying root system, it becomes the ideal nesting environment for subterranean termites — the species responsible for 95% of structural damage in the Southeast. Entomology studies from the University of Florida's IFAS extension have documented termite colonization in residential stumps within as little as 90 days under warm, humid conditions. In Florida's climate, that timeline often runs faster.",
      },
      {
        heading: "Why a stump in the yard puts the house at risk",
        body: "Subterranean termites build foraging tunnels that can extend 100+ feet from the colony. Once they're established in a stump, they don't just stay there — they send out scout workers in every direction looking for more cellulose. If your home has any wood that touches soil (porch posts, deck supports, siding within 6 inches of grade, or even the wooden forms left buried under a slab during construction), the termites already living in your stump have a clear path to it.",
      },
      {
        heading: "The hidden costs of a stump you ignore",
        body: "Beyond termites, stumps cause a cascade of yard problems: they re-sprout for years (especially oaks and crepe myrtles), they harbor carpenter ants and roaches, they attract snakes looking for prey, they prevent proper lawn drainage, they make mowing dangerous, and they slowly sink as the root system rots — leaving a depression that can become a tripping hazard or trap water. Most homeowners spend more over five years dealing with a stump's side effects than they would have spent grinding it out.",
      },
      {
        heading: "Grinding vs. chemical removal vs. excavation",
        body: "There are three ways to deal with a stump. Chemical stump killers (potassium nitrate) take 6-12 months and still leave the wood in place — termites love them. Full excavation digs out the entire root ball but tears up the surrounding yard and is the most expensive option. Professional stump grinding uses a machine to chip the stump 8-12 inches below grade in 30-60 minutes, leaves the root system to decompose harmlessly underground, and lets you regrade and replant the same week. For 95% of residential stumps, grinding is the right answer.",
      },
      {
        heading: "What a proper grind actually looks like",
        body: "A real stump grind goes well below grade — at least 8 inches, often 12 — so the stump can be covered with topsoil and never resurface. The chips should be raked back into the hole or hauled off, leaving you with clean, level ground. Cheap grinders sometimes only take 2-3 inches off the top so the stump is hidden but still rotting — and still attracting pests. Always ask how deep the grind goes before you book.",
      },
    ],
    faqs: [
      {
        q: "How long does stump grinding take?",
        a: "Most residential stumps are ground in 20-60 minutes. Larger stumps with extensive surface roots can take longer.",
      },
      {
        q: "Can I plant grass over a ground stump right away?",
        a: "Yes — once the chips are removed and topsoil is added, you can re-seed or sod within days.",
      },
      {
        q: "What's the average cost of stump grinding?",
        a: "Most residential stumps in our area run $100-$400 depending on diameter, location, and grind depth. We discount when grinding multiple stumps in one visit.",
      },
    ],
    cta: {
      headline: "Got a stump? Get rid of it before pests find it.",
      body: "Free quote, fast turnaround, and a real grind 8-12 inches below grade. We'll haul the chips and leave the yard ready to replant.",
    },
    related: ["fallen-trees-insurance-claims", "yard-debris-pest-habitat", "land-clearing-property-value"],
  },

  // 3
  {
    slug: "trimming-extends-tree-lifespan",
    cardTitle: "Tree Trimming",
    title: "How Regular Trimming Adds Decades to a Healthy Tree's Life",
    fact: "Regular trimming can extend a healthy tree's lifespan by 30% or more.",
    excerpt:
      "A well-trimmed oak can outlive its untouched neighbor by 30 years or more. Here's the science behind why — and how often to actually trim.",
    readMinutes: 5,
    category: "Tree Care",
    image: bucketLiftTrim,
    imageAlt: "Bucket lift trimming overhanging tree limbs",
    intro:
      "If you've ever wondered whether tree trimming is really worth the money, the answer from the International Society of Arboriculture is a clear yes. Properly trimmed trees live measurably longer, suffer dramatically fewer storm failures, and develop the kind of strong central structure that lets them shrug off the winds that take down their unkept neighbors. Studies on managed urban canopies have found lifespan increases of 30% or more compared to unmanaged trees of the same species.",
    sections: [
      {
        heading: "What trimming actually does for a tree",
        body: "Healthy trimming removes three categories of growth: dead or diseased wood (which is already a liability), crossing or rubbing branches (which create wounds and entry points for fungi), and competing leaders or weak unions (which become the failure points in storms). Removing these focuses the tree's energy on its strongest, healthiest scaffold — the same way pruning a fruit tree gives you bigger fruit on stronger limbs.",
      },
      {
        heading: "How often is 'regular' trimming?",
        body: "The right cadence depends on age and species. Young trees (under 10 years) benefit most from annual structural pruning — this is when you set up the long-term shape and prevent the bad unions that cause failures decades later. Mature trees usually need a professional once-over every 3-5 years to remove deadwood, lift the canopy, and address any new structural issues. Storm-damaged trees should be assessed within 30 days of a major weather event so wounds can be cleaned up before fungi colonize them.",
      },
      {
        heading: "The cost of waiting too long",
        body: "Trees that go a decade without trimming develop predictable problems: canopies become top-heavy and catch wind like a sail, deadwood accumulates and starts dropping, water sprouts proliferate and steal energy from the main scaffold, and small structural defects that could have been corrected with a 1-inch cut now require a 6-inch cut that the tree can't seal over. The result is a tree that looks fine until it suddenly doesn't — usually during a storm.",
      },
      {
        heading: "Why bad trimming is worse than no trimming",
        body: "'Topping' — cutting major limbs back to stubs to make a tree shorter — is the single most damaging practice in the tree industry, and unfortunately it's still widely practiced. It triggers a flush of weak water sprouts, exposes the trunk to sunscald and decay, and dramatically shortens the tree's lifespan. Reputable arborists follow ANSI A300 pruning standards, which prohibit topping and emphasize cuts at proper branch collars. If a tree company quotes you a 'topping' job, walk away.",
      },
      {
        heading: "Signs your tree needs trimming now",
        body: "You should call an arborist if you see any of: branches hanging within 8 feet of the roof, dead branches larger than 2 inches in the canopy, branches contacting power lines, a noticeable lean developing, large amounts of falling small branches after wind, or visible cavities, oozing wounds, or fungal conks on the trunk. Many of these are easy fixes today and become expensive emergencies if ignored.",
      },
    ],
    faqs: [
      {
        q: "When is the best time of year to trim trees in Florida?",
        a: "For most species, late winter (Jan-Feb) is ideal. Storm-prep trimming should happen well before June. Live oaks have specific timing rules to avoid oak wilt.",
      },
      {
        q: "How much should I expect to pay for tree trimming?",
        a: "Most residential trims in Northwest Florida run $250-$1,200 depending on tree size, access, and how much deadwood there is. We give free written estimates.",
      },
      {
        q: "Can I trim my own trees?",
        a: "Small ornamentals from the ground? Sure. Anything requiring a ladder, chainsaw, or proximity to power lines should be done by an insured professional — tree work has one of the highest injury rates of any trade.",
      },
    ],
    cta: {
      headline: "Want your trees to outlive the next 50 years?",
      body: "Get a free trimming assessment from IGY6 Rooted. We follow ANSI standards, never top, and leave your canopy looking natural — not butchered.",
    },
    related: ["pruning-prevents-tree-failures", "fallen-trees-insurance-claims", "hazard-tree-assessment-checklist"],
  },

  // 4
  {
    slug: "pruning-prevents-tree-failures",
    cardTitle: "Tree Pruning",
    title: "Why Most Tree Failures Start With Bad Pruning in the First 10 Years",
    fact: "Most structural tree failures trace back to poor pruning in the first 10 years.",
    excerpt:
      "The tree that splits in your yard during a hurricane was probably set up to fail when it was 8 feet tall. Here's how proper early pruning prevents lifetime structural failure.",
    readMinutes: 6,
    category: "Tree Care",
    image: treePruning,
    imageAlt: "Arborist pruning dead branches from a mature tree",
    intro:
      "Walk through any neighborhood after a major windstorm and you'll see a pattern: certain trees split right down the middle while others nearby came through untouched. It's almost never bad luck. Arborist research consistently shows that the structural defects responsible for most catastrophic tree failures were established when the tree was young — usually in the first 5 to 10 years — and could have been corrected with simple, inexpensive pruning at the time.",
    sections: [
      {
        heading: "The defect that takes down most mature trees",
        body: "It's called 'included bark' — and it forms whenever two stems grow together at a tight V-angle instead of a wide U-angle. As the stems thicken, bark gets pushed inward between them instead of forming a strong wood union. The result is a hidden weak spot that looks fine for 30 or 40 years and then suddenly splits open during a hurricane, often taking half the tree (and everything below it) down. A 60-second cut on a sapling prevents this. A repair on a mature tree often isn't possible.",
      },
      {
        heading: "What young-tree pruning actually involves",
        body: "Structural pruning of a young tree focuses on three things: establishing a single dominant central leader (so the tree builds around one strong trunk), removing co-dominant stems before they form included bark, and spacing the permanent scaffold branches around the trunk like rungs on a spiral staircase. None of this is dramatic — most young-tree prunes remove less than 15% of live tissue — but the long-term payoff is enormous.",
      },
      {
        heading: "The myth of 'leaving trees alone'",
        body: "Many homeowners believe that 'natural' trees grow stronger than pruned ones. In a forest, that's somewhat true — competing trees prune each other by shading out lower branches. But a yard tree growing in full sun with no neighbors will develop dense, low, multi-stemmed growth that's structurally weak and high-maintenance for the next 80 years. Yard trees need human intervention because we've removed the ecological pressure that would have shaped them naturally.",
      },
      {
        heading: "Pruning mature trees: less is more",
        body: "Once a tree is mature, the goal of pruning shifts. Heavy pruning on an old tree can shock it, trigger unhealthy water-sprout growth, and create wounds it can't seal. Mature tree pruning should generally remove no more than 10-15% of live foliage in a single year, focus on deadwood and clearance, and use proper cuts at the branch collar. If a 'tree service' wants to thin 40% of an old oak — get a second opinion.",
      },
      {
        heading: "When to call an arborist vs. DIY",
        body: "DIY pruning is fine for ornamentals under 15 feet that you can comfortably reach with a pole pruner from the ground. Anything larger — anything requiring a ladder, anything over a structure or near power lines, anything where you can't see what you're cutting clearly — should be left to a professional. Tree work consistently ranks in the top 10 most dangerous occupations in the U.S., and DIY-ladder-and-chainsaw injuries fill ER waiting rooms after every storm.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between trimming and pruning?",
        a: "In practice the words overlap. Most arborists use 'pruning' for structural and health-focused cuts, and 'trimming' for aesthetic shaping. The skill set is the same.",
      },
      {
        q: "Will pruning hurt my tree?",
        a: "Done correctly, no — proper pruning at the branch collar lets the tree seal the wound naturally. Done badly (topping, flush cuts, stub cuts), pruning can dramatically shorten a tree's lifespan.",
      },
      {
        q: "How young is too young to prune a new tree?",
        a: "Most arborists recommend waiting until the tree has been in the ground for one full growing season, then starting structural pruning the following winter.",
      },
    ],
    cta: {
      headline: "Set your young trees up for a 100-year life.",
      body: "Schedule a structural pruning visit. We'll handle the kind of small, smart cuts that save tens of thousands in storm damage decades from now.",
    },
    related: ["trimming-extends-tree-lifespan", "fallen-trees-insurance-claims", "hazard-tree-assessment-checklist"],
  },

  // 5
  {
    slug: "florida-named-storms-emergency-response",
    cardTitle: "Emergency Tree Removal",
    title: "Why Florida Leads the Nation in Named Storms — and What That Means for Your Trees",
    fact: "Florida averages more named storms than any other U.S. state — fast response matters.",
    excerpt:
      "Florida is hit by more named tropical storms than any other state. Here's what to do in the first 24 hours when a tree comes down on your property.",
    readMinutes: 6,
    category: "Storm Prep",
    image: fallenOakStorm,
    imageAlt: "Large oak tree fallen in a Northwest Florida backyard after a tropical storm",
    intro:
      "According to NOAA's historical hurricane database, Florida has been struck by more named tropical systems than any other U.S. state — by a wide margin. Northwest Florida sits in one of the most active zones in the entire Gulf, and the storms that affect us tend to be wetter and slower-moving than they were 30 years ago. When a tree comes down on your home, garage, fence, or driveway in the middle of the night during a hurricane, what happens in the first 24 hours determines how much it ultimately costs you.",
    sections: [
      {
        heading: "Step 1 — Stay safe before you assess",
        body: "After a storm, the single biggest cause of injury isn't the storm itself — it's homeowners trying to deal with damage in the dark. Never go near a downed tree until you've ruled out: live power lines (assume every wire is energized until utility confirms otherwise), gas leaks (smell, listen for hissing), structural damage (don't enter rooms where a tree has come through the roof until a professional clears them), and standing water around any electrical equipment. If anything looks wrong, evacuate the area and call 911 first, then your utility, then a tree professional.",
      },
      {
        heading: "Step 2 — Document everything for insurance",
        body: "Before anything is moved or cut, photograph the damage from every angle. Get wide shots showing the full scene, then close-ups of impact points, broken branches, and any visible damage to your home or vehicles. Time-stamped photos from your phone are perfect. Do this even if you're certain about the cause — insurance adjusters will want to see the original state, and removal often happens before they can come out.",
      },
      {
        heading: "Step 3 — Call your insurance, then a 24/7 tree service",
        body: "File the claim immediately, even if you don't know the full extent of damage yet — most policies require notification within 72 hours. Then call a tree removal service that actually answers the phone after hours. In Northwest Florida, the busiest 48 hours after a hurricane will see most reputable companies booked solid. Established locals (and especially veteran-owned crews with their own equipment) are usually your fastest path to actual on-site help.",
      },
      {
        heading: "What 'emergency removal' actually involves",
        body: "Emergency tree removal is fundamentally different from a planned removal. The tree is often under load (still partially supported), in unstable position, with branches sprung under tension that can release violently when cut. Crews use rigging to relieve tension before any saw cuts, work in coordinated teams (never solo), and often use a crane or bucket lift even for small trees because positioning matters more than speed. This is why emergency rates run higher than scheduled work — you're paying for the experience that prevents a second tragedy.",
      },
      {
        heading: "How to be ready before the next storm",
        body: "The single best thing you can do is have a pre-storm tree assessment done in May, before hurricane season starts. An arborist will identify hazard trees within striking distance of your home, recommend any preventive removals or structural pruning, and give you a relationship with a crew that will actually come out when the next storm hits. We keep a priority callback list for past clients — and after a major storm, that list matters.",
      },
    ],
    faqs: [
      {
        q: "Do you really respond 24/7?",
        a: "Yes — a member of our team is reachable around the clock during storm events. We prioritize life-safety situations (trees on homes with people inside, blocked emergency access) first.",
      },
      {
        q: "Will my insurance cover emergency tree removal?",
        a: "If the tree fell on a covered structure, usually yes — up to your per-tree limit. Trees that fell in the yard alone often aren't covered. Save all receipts and photos.",
      },
      {
        q: "How fast can you actually get to me after a hurricane?",
        a: "Honestly — it depends on storm severity. Minor weather: same day. Major hurricane with widespread damage: we work life-safety calls first, then schedule remaining jobs. We'll always give you a real time window.",
      },
    ],
    cta: {
      headline: "Tree on your house right now?",
      body: "Call (518) 265-0275. We're a veteran-owned local crew with our own bucket lifts and we answer the phone after hours.",
    },
    related: ["hurricane-tree-debris-cleanup", "fallen-trees-insurance-claims", "hazard-tree-assessment-checklist"],
  },

  // 6
  {
    slug: "climbing-rigging-dangerous-jobs",
    cardTitle: "Climbing & Rigging",
    title: "Why Tree Work Ranks Among America's Most Dangerous Jobs",
    fact: "Tree work is one of the top 10 most dangerous jobs in America — leave the climbing to the pros.",
    excerpt:
      "BLS data consistently ranks tree work among America's deadliest occupations. Here's why — and what 'rigging' actually means when a tree is too tight to drop.",
    readMinutes: 5,
    category: "Safety",
    image: climberPine,
    imageAlt: "IGY6 Rooted climber rigging a tall pine tree",
    intro:
      "Tree work has consistently ranked among the most dangerous occupations in the United States according to Bureau of Labor Statistics fatality data. The combination of chainsaws, heights, falling wood, and unpredictable failure points puts arborists in a category alongside commercial fishing and roofing for workplace fatalities. When a tree is too close to a structure or power line to simply drop, the only safe option is rigging — controlled lowering of pieces from a climber in the canopy. It's specialized, expensive, and absolutely worth it.",
    sections: [
      {
        heading: "Why rigging exists",
        body: "Sometimes a tree is in a spot where you can't just cut the trunk and let it fall — there's a house under it, a pool, a power line, a neighbor's fence, or another tree you don't want to damage. Rigging solves this by having a climber ascend the tree, attach pieces to a controlled rope system, cut them off, and lower them gently to the ground crew. Done right, a 60-foot pine surrounded by structures comes apart piece by piece without anything below being touched.",
      },
      {
        heading: "What separates a real climber from a 'guy with a chainsaw'",
        body: "A trained arborist climbs with a saddle and twin rope system, knows how to read wood under tension, understands which tie-in points will hold, can switch between aerial techniques mid-climb, and never works alone. They've spent years learning rigging math (how much force a falling 200-lb log generates on a redirect line, for example). The cheapest 'tree guy' on Craigslist often skips most of this — which is why the ER fills up after every storm.",
      },
      {
        heading: "When climbing is safer than a bucket lift",
        body: "Bucket lifts are great when there's truck access. But many residential trees grow in backyards behind fences, on slopes, near pools, or in spots where a 30,000-lb truck can't reach without destroying the lawn and irrigation. In these situations a climber is actually safer and less destructive than trying to maneuver heavy equipment in. Knowing when to use which is a judgment call we make on every estimate.",
      },
      {
        heading: "The hidden costs of cheap tree work",
        body: "Uninsured tree workers are the #1 source of homeowner liability nightmares in this trade. If an uninsured climber falls on your property, you can be held personally responsible for medical costs and lost wages — easily six figures. Always ask to see proof of both general liability AND workers' comp coverage. A real tree company will hand it over without hesitation. If they hesitate, walk away.",
      },
      {
        heading: "What to expect during a rigging job",
        body: "Most rigging jobs take 2-4x longer than a simple drop-and-chunk removal. The crew arrives with extra rope, blocks, redirect pulleys, and ground tarps. The climber sets a high tie-in point first, then works down, lowering pieces on the rope while ground crew receives and processes them. Expect a lot of communication between climber and ground (everything is verbalized for safety). It's slow, methodical, and exactly what you want when there's a pool 10 feet from the trunk.",
      },
    ],
    faqs: [
      {
        q: "Is climbing always more expensive than felling?",
        a: "Yes — typically 2-4x more, because it takes longer and requires more skilled labor. But it's the only option when a tree can't be safely dropped.",
      },
      {
        q: "What if I just want to climb my own tree to trim it?",
        a: "We strongly recommend against it. Recreational tree climbing is a thing, but doing it with a chainsaw, alone, without proper training is how people die. Hire it out.",
      },
      {
        q: "How do I verify a tree company is properly insured?",
        a: "Ask for a Certificate of Insurance (COI) listing both general liability and workers' comp. They can have it emailed to you directly from their insurance carrier.",
      },
    ],
    cta: {
      headline: "Got a tree in a tight spot?",
      body: "We do bucket-lift, climbing, and crane removals — whatever's safest for your property. Free quote, fully insured, veteran-owned.",
    },
    related: ["fallen-trees-insurance-claims", "florida-named-storms-emergency-response", "trimming-extends-tree-lifespan"],
  },

  // 7
  {
    slug: "hurricane-tree-debris-cleanup",
    cardTitle: "Hurricane Storm Cleanup",
    title: "How Many Tons of Tree Debris a Single Hurricane Drops on a Florida Lot",
    fact: "A single hurricane can drop thousands of pounds of tree debris on a Florida lot.",
    excerpt:
      "Hurricanes don't just knock down trees — they fill your yard with tons of tangled debris. Here's what cleanup actually involves and why it's worth hiring out.",
    readMinutes: 5,
    category: "Storm Prep",
    image: bucketLiftHouse,
    imageAlt: "IGY6 Rooted crew with bucket lift performing post-storm cleanup",
    intro:
      "After Hurricane Michael, FEMA recorded over 75 million cubic yards of vegetative debris removed from Northwest Florida alone — and that was from a single storm. On an average residential lot in a hurricane's path, total debris weight commonly runs into the thousands of pounds: broken limbs, shredded foliage, partial trunks, fence pieces, and roofing materials all tangled together. Cleanup is a different job than tree removal, and it's where most homeowners realize they're in over their heads.",
    sections: [
      {
        heading: "Why post-hurricane debris is uniquely difficult",
        body: "Post-storm debris isn't just a pile of branches — it's an unstable web of broken wood under tension, often mixed with structural debris (siding, shingles, insulation, broken glass) and frequently still attached to standing trees or partially-collapsed structures. Pulling on the wrong piece can release stored energy and injure whoever's holding it. This is why post-storm injury rates spike for two weeks after every major storm.",
      },
      {
        heading: "What FEMA pickup actually covers (and when)",
        body: "After a federally-declared disaster, FEMA contractors will eventually come through and haul vegetative debris from the right-of-way (the strip between the sidewalk and the street). They will not enter your yard, will not disentangle debris from structures, and will not haul anything that's not properly separated and stacked at the curb. The wait can be weeks. If you want your yard usable before then, you'll be doing the staging yourself or hiring a private crew.",
      },
      {
        heading: "How professional storm cleanup works",
        body: "A professional storm cleanup crew arrives with chainsaws, chippers, dump trailers, and skid steers. We assess for hazards (hangers, broken limbs still in the canopy, leaning trees), drop anything that's still a danger, then process the debris on-site — chipping smaller material and hauling the larger trunks. A typical residential post-storm cleanup runs 4-12 hours depending on damage; a large lot or commercial property can take days.",
      },
      {
        heading: "Hangers — the silent killer in your canopy",
        body: "After every storm, broken branches get caught in the canopy instead of falling to the ground. These 'hangers' or 'widow makers' can drop weeks or months later, often during ordinary weather. Anyone walking under your trees is in danger until they're cleared. A trained arborist will identify and remove hangers as part of cleanup — DIY ground-level cleanup will leave them exactly where they are.",
      },
      {
        heading: "Should you tackle any of it yourself?",
        body: "Honestly — small stuff, sure. Twigs, small branches under 3 inches, raking leaves: knock yourself out. But anything requiring a chainsaw, anything caught in another tree, anything touching a power line or structure, anything you'd need a ladder for, and anything you can't see clearly should be left to professionals. Florida ERs see a spike in chainsaw injuries every fall for exactly this reason.",
      },
    ],
    faqs: [
      {
        q: "How fast can you start cleanup after a storm?",
        a: "Same day for minor weather. After a major hurricane we work life-safety calls (trees on homes) first, then standard cleanup in the order calls came in. We'll give you a realistic window.",
      },
      {
        q: "Do you haul debris away or leave it for FEMA?",
        a: "Both options available. Hauling is faster but costs more. We can also stack at the curb to FEMA spec if you want to save money and wait for pickup.",
      },
      {
        q: "Will my insurance pay for cleanup?",
        a: "Cleanup of debris that hit a covered structure is usually covered. Yard-only cleanup typically isn't. Document everything before any work starts.",
      },
    ],
    cta: {
      headline: "Yard buried in storm debris?",
      body: "We bring the chainsaws, chippers, and dump trailers. Free quote on full cleanup or hauling-only. Veteran-owned, local, and fully insured.",
    },
    related: ["florida-named-storms-emergency-response", "fallen-trees-insurance-claims", "yard-debris-pest-habitat"],
  },

  // 8
  {
    slug: "hazard-tree-assessment-checklist",
    cardTitle: "Hazard Tree Assessment",
    title: "The 12-Point Hazard Tree Assessment Every Homeowner Should Know",
    fact: "Most failed trees showed visible warning signs months before they fell.",
    excerpt:
      "Almost every catastrophic tree failure was preceded by visible warning signs. Here's the 12-point checklist arborists use to spot a hazard tree.",
    readMinutes: 6,
    category: "Safety",
    image: hazardAssessment,
    imageAlt: "Certified arborist inspecting a mature oak tree for hazards",
    intro:
      "Walk around your property on a calm Saturday morning with a cup of coffee and 20 minutes to spare, and you can do most of what a professional arborist does in their initial hazard inspection. You won't catch everything — internal decay and root issues need trained eyes and sometimes special equipment — but you'll catch the obvious red flags that account for the majority of preventable tree failures. Here's the checklist we use on every IGY6 Rooted assessment.",
    sections: [
      {
        heading: "Start at the base — the root collar tells the truth",
        body: "Walk around the trunk and look at where it meets the ground. You should see a slight flare — the trunk widening as it transitions to roots. If the trunk goes straight into the ground like a telephone pole, the root flare is buried (usually from too-deep planting or piled mulch), and the tree is silently rotting. Look for: mushrooms or fungal conks at the base (active rot), cracked or heaved soil on one side (root failure starting), exposed major roots that have been damaged by mowing, and any recent excavation within the dripline.",
      },
      {
        heading: "Sound the trunk — listen for hollow",
        body: "Take a rubber mallet or the back of a hammer and tap the trunk at chest height, working your way around. A solid trunk produces a sharp, ringing sound. A hollow or decayed section sounds dull, like tapping a watermelon. Significant hollows (more than 30% of the trunk diameter) are a serious red flag and warrant a professional assessment. Some trees can live for decades with hollow trunks — but they shouldn't be near structures.",
      },
      {
        heading: "Inspect the trunk surface for cracks and seams",
        body: "Look for vertical cracks running up the trunk, especially ones that have appeared or grown recently. A crack longer than 12 inches and deep enough to fit a dime in is a structural concern. Seams where the bark has split open after a freeze or hard wind suggest internal damage. Bleeding wounds (sap or dark fluid running from a wound) often indicate active infection.",
      },
      {
        heading: "Examine branch unions for V-angles",
        body: "Where major branches meet the trunk, you want to see a U-shaped union with a clear ridge of bark on top — that's a strong attachment. A tight V-angle, especially with bark that appears to be growing inward, signals 'included bark' — the structural weak point that causes most catastrophic splits during storms. If you can see two roughly equal-sized stems forming a V, that's the highest-risk failure point on the entire tree.",
      },
      {
        heading: "Look up — assess the canopy for deadwood and lean",
        body: "Step back 50 feet and look at the overall shape. Note any obvious lean (especially recent — compare to old photos if you have them). In the canopy itself, dead branches show up as bare or sparsely-leaved sections, often with visible dead twigs. Anything more than 2 inches in diameter that's dead is a 'widow maker' that can drop in any wind. Heavy deadwood concentration is a sign the tree is in decline.",
      },
      {
        heading: "What to do if you spot something",
        body: "If you find any of: significant trunk decay, fresh root heaving, included bark on a major union, a recent lean, or large amounts of deadwood — call a professional for a full assessment before the next storm season. Most of these issues have remediation options (cabling, bracing, structural pruning, partial removal) when caught early. Once a tree fails, options shrink to one: emergency removal, usually after damage has already been done.",
      },
    ],
    faqs: [
      {
        q: "How often should I inspect my trees?",
        a: "A quick visual walkaround every spring is plenty for most homeowners. After any major windstorm, do another walkaround within a week. Get a professional inspection every 3-5 years for mature trees near structures.",
      },
      {
        q: "Can a tree look fine and still be dangerous?",
        a: "Absolutely — internal decay and root issues can be invisible from outside. That's why professional assessments include sounding, root collar inspection, and sometimes resistance drilling.",
      },
      {
        q: "What does a professional hazard assessment cost?",
        a: "We do free initial assessments for properties in our service area. Detailed written reports with risk ratings (sometimes needed for HOA or insurance purposes) run $150-$400 depending on scope.",
      },
    ],
    cta: {
      headline: "Not sure if your trees are safe?",
      body: "Free hazard assessment from a veteran-owned local crew. We'll walk your property, point out anything concerning, and give you straight advice — no hard sell.",
    },
    related: ["fallen-trees-insurance-claims", "pruning-prevents-tree-failures", "trimming-extends-tree-lifespan"],
  },

  // 9
  {
    slug: "land-clearing-property-value",
    cardTitle: "Land Clearing",
    title: "How Land Clearing Adds 20–40% to a Vacant Lot's Market Value",
    fact: "Professional land clearing can boost a vacant lot's market value by 20–40%.",
    excerpt:
      "An overgrown lot scares off buyers and builders. Here's how a professional clear transforms 'maybe' land into 'shovel-ready' land — and why the ROI is so high.",
    readMinutes: 5,
    category: "Property",
    image: skidSteer,
    imageAlt: "Skid steer clearing brush and prepping a residential lot",
    intro:
      "If you've ever shopped for vacant land, you know the feeling: you pull up to a listing, look at a wall of palmettos, scrub oak, and pine slash, and immediately knock 30% off your mental offer just because you can't see what you're buying. Land clearing flips that math. A cleared lot lets buyers and builders see boundaries, contours, drainage, and buildable area at a glance — and real estate professionals routinely price cleared lots 20-40% higher than identical overgrown ones.",
    sections: [
      {
        heading: "Why overgrown lots get discounted",
        body: "Buyers can't price what they can't see. An overgrown lot hides everything that matters: lot lines, slope, drainage patterns, soil quality, hidden hazards (old wells, dump piles, dead trees), and the actual buildable footprint. Most buyers won't make an offer at all on heavily overgrown land — they'll move on to something they can evaluate. The buyers who do make offers price in the cost of clearing PLUS a risk premium for the unknowns. Net result: the seller absorbs a discount of 20-40%.",
      },
      {
        heading: "What 'professional clearing' actually means",
        body: "There's a big difference between 'someone with a chainsaw' and a professional clearing crew. A real clear involves: assessment of what to keep (often heritage trees, certain hardwoods, anything in protected zones), strategic removal of underbrush and undesirable vegetation, stump grinding or excavation as appropriate, proper handling of organic debris (chipping, hauling, or burning where permitted), grade work as needed, and final clean appearance. The result is a lot you can walk every inch of.",
      },
      {
        heading: "What stays vs. what goes",
        body: "Smart clearing isn't about removing everything — it's about removing what hurts the lot's value while preserving what helps it. Mature shade trees in good condition can add tens of thousands of dollars to a lot's appeal and dramatically reduce future cooling costs for whatever gets built. We work with you to flag any tree you want to keep, identify others worth preserving, and selectively remove the rest. Florida also has rules about specific protected species (live oaks, certain pines) that we navigate as part of every clearing job.",
      },
      {
        heading: "Equipment matters more than you'd think",
        body: "Hand-clearing a half-acre lot takes weeks. The right equipment — skid steer with a mulching head, mini-excavator with a thumb attachment, stump grinder, chipper — gets the same job done in 1-3 days with better results and dramatically less ground disturbance. Tracked equipment leaves minimal lasting impact compared to wheeled machinery, which matters when you're trying to keep the lot ready for foundation work.",
      },
      {
        heading: "Permits and protected-species considerations",
        body: "In most Northwest Florida jurisdictions, you can clear underbrush and small trees without a permit. Once you're removing larger trees, particularly protected species like live oaks, permits may be required. We pull all necessary permits as part of our clearing service and handle the paperwork with the city or county. DIY clearing without proper permits can result in fines that exceed the cost of professional clearing.",
      },
    ],
    faqs: [
      {
        q: "How much does land clearing cost per acre?",
        a: "Highly variable — light underbrush clearing can run $1,500-$3,000 per acre. Dense vegetation with mature trees can run $4,000-$10,000+ per acre. We give free written estimates after walking the lot.",
      },
      {
        q: "Will clearing damage my soil or drainage?",
        a: "Done correctly, no — we use tracked equipment and leave organic matter where it benefits the soil. Done badly, clearing can cause erosion and compaction, which is why equipment choice matters.",
      },
      {
        q: "Do I need a permit to clear my own land?",
        a: "It depends on what's being removed and where the lot is. Light brush usually doesn't. Removing protected trees usually does. We handle permitting on every job as part of the service.",
      },
    ],
    cta: {
      headline: "Sitting on overgrown land?",
      body: "Get a free clearing estimate from IGY6 Rooted. We'll walk the lot, flag what to keep, and give you a fixed-price quote to make it shovel-ready.",
    },
    related: ["lot-clearing-new-construction-permits", "stumps-attract-termites", "brush-wildfire-defensible-space"],
  },

  // 10
  {
    slug: "lot-clearing-new-construction-permits",
    cardTitle: "Lot Clearing for New Builds",
    title: "Why Florida Building Permits Often Require a Fully Cleared Lot",
    fact: "Florida building permits often require a fully cleared lot before foundation work begins.",
    excerpt:
      "If you're building in Florida, the contractor can't pour a foundation on uncleared land. Here's what 'cleared to permit standard' actually means.",
    readMinutes: 5,
    category: "Property",
    image: landClearing,
    imageAlt: "Cleared residential lot ready for new construction",
    intro:
      "If you're planning new construction in Northwest Florida, one of the first things you'll learn is that your contractor can't break ground on a lot that isn't properly cleared. Most municipalities — including Niceville, Crestview, Destin, and unincorporated Okaloosa County — require a lot to be cleared to specific standards before they'll issue a foundation permit or schedule the required surveys. Understanding what 'cleared' actually means in code language can save you weeks of construction delay.",
    sections: [
      {
        heading: "What 'cleared' means in building department language",
        body: "Most Florida building departments require, at minimum: all vegetation removed within the building envelope plus a working perimeter (typically 10-15 feet beyond the foundation footprint), all stumps removed or ground below grade, organic material hauled off (decomposing roots cause future settling), no debris piles within construction zones, and the area graded smooth enough for survey crews to set lines. Some cities require additional setback clearing or specific tree-protection fencing around any preserved trees.",
      },
      {
        heading: "The order of operations matters",
        body: "Smart building sequence: 1) survey to identify property lines, easements, setbacks, and any protected trees, 2) tree-protection fencing installed around anything being preserved, 3) selective clearing of the building envelope and access paths, 4) stump removal, 5) initial grading, 6) erosion control measures (silt fencing) installed if required, 7) building department inspection, 8) foundation work begins. Skipping or reordering steps usually means a stop-work order until it's corrected.",
      },
      {
        heading: "Tree preservation requirements vary by city",
        body: "Niceville, Destin, Fort Walton Beach, and unincorporated areas all have different rules about which trees must be preserved during construction. Live oaks of certain diameter classes are commonly protected. Mitigation requirements (replacing protected trees you remove with new plantings or paying into a tree fund) can add significant cost if not planned for. We pull the city-specific requirements as part of every new-construction clearing estimate.",
      },
      {
        heading: "Erosion and stormwater compliance",
        body: "Once a lot is cleared, Florida's stormwater rules require erosion control until permanent vegetation is re-established or the building is complete. This means silt fencing, sometimes hay bales or wattles, and occasionally temporary seeding. Failing to maintain erosion control during construction is one of the most common code violations. We handle initial erosion control as part of clearing on most new-build jobs.",
      },
      {
        heading: "Working with your builder vs. clearing first",
        body: "Some general contractors include clearing in their scope and bring their own crews. Others require the lot owner to deliver a cleared lot before the GC mobilizes. Both approaches work — but if the GC is doing it, make sure clearing is itemized in the contract so you know what's included. If you're clearing in advance of selecting a builder, get the GC's clearing requirements in writing first so you don't redo work.",
      },
    ],
    faqs: [
      {
        q: "How long does a residential lot clearing take?",
        a: "Most quarter-to-half-acre lots clear in 1-3 days depending on density. Larger lots or heavy mature growth can take a week.",
      },
      {
        q: "Can you preserve specific trees during clearing?",
        a: "Yes — flag any tree you want kept and we'll install protective fencing around the root zone and avoid soil compaction or root damage in those areas.",
      },
      {
        q: "Do I need to be present during clearing?",
        a: "Not required, but a walk-through at the start to confirm what stays and what goes is highly recommended. Decisions made on-the-fly without owner input usually lead to regrets.",
      },
    ],
    cta: {
      headline: "Building on a wooded lot?",
      body: "We'll clear it to permit standard, preserve the trees you want to keep, and coordinate with your builder. Free written estimate — call (518) 265-0275.",
    },
    related: ["land-clearing-property-value", "stumps-attract-termites", "brush-wildfire-defensible-space"],
  },

  // 11
  {
    slug: "brush-wildfire-defensible-space",
    cardTitle: "Brush & Wildfire Defensible Space",
    title: "Why 30 Feet of Defensible Space Around Your Home Matters",
    fact: "Dense brush within 30 ft of a home is one of the top wildfire risk factors.",
    excerpt:
      "Wildfire research consistently identifies a 30-foot 'defensible space' as the single biggest factor in whether a home survives. Here's what to clear and why.",
    readMinutes: 5,
    category: "Safety",
    image: brushRemoval,
    imageAlt: "Cleared brush along a residential property line",
    intro:
      "Northwest Florida doesn't get California-style mega-fires — but Florida averages roughly 4,000 wildfires per year, and the wildland-urban interface where most of us live is exactly the kind of terrain where brush fires turn into structure fires. The Florida Forest Service and the National Fire Protection Association have spent decades studying which homes survive wildfires and which don't. The single biggest predictor isn't roof material or window type — it's whether the homeowner maintained 30 feet of defensible space around the structure.",
    sections: [
      {
        heading: "What 'defensible space' actually means",
        body: "Defensible space is a managed zone around your home where vegetation has been thinned, ladder fuels removed, and combustible materials cleared so that an approaching fire either runs out of fuel or burns at low enough intensity that firefighters can defend the structure. NFPA recommends a minimum of 30 feet of treated space — some guidance extends to 100 feet for higher-risk areas. In Florida's pine flatwoods, even modest defensible-space management dramatically improves home survival odds.",
      },
      {
        heading: "Zone-by-zone breakdown",
        body: "Zone 1 (0-5 ft from structure): no flammable mulch, no vegetation against siding, no shrubs under windows or eaves, hardscape preferred. Zone 2 (5-30 ft): low-growing, well-watered plants only; trees pruned up so lowest branches are 6+ ft above ground; no brush piles or stacked firewood; spacing between tree canopies. Zone 3 (30-100 ft): thinned native vegetation, removed deadwood and dense underbrush, clear paths through woody fuel.",
      },
      {
        heading: "Ladder fuels — the under-recognized danger",
        body: "A 'ladder fuel' is any vegetation that lets ground fire climb up into the tree canopy. Once fire gets into the canopy, it generates enough heat and ember production to ignite homes hundreds of feet away. The classic ladder is a saw palmetto or wax myrtle growing under a longleaf pine — the brush ignites, flames climb the lower branches, and suddenly the entire tree is torching. Removing or properly limbing-up these ladder fuels is one of the highest-impact defensible-space improvements you can make.",
      },
      {
        heading: "What to clear (and what to leave)",
        body: "Clear: dead and downed wood within 30 ft, brush piles, dense shrub layers, lower branches on conifers within striking distance of the structure, combustible mulch within 5 ft of the house, dead palm fronds (a major ember source). Leave: healthy mature shade trees with high canopies (they actually shield homes from radiant heat), well-irrigated lawn, properly spaced low-growing native plants. Defensible space isn't about creating a moonscape — it's about strategic vegetation management.",
      },
      {
        heading: "Insurance and code implications",
        body: "Some insurers in Florida (especially after the recent market hardening) now offer discounts or required mitigations tied to wildfire risk, including defensible-space requirements. Some HOAs and rural communities require it. And in the event of a major wildfire, evacuation orders and post-fire claim handling can both be affected by whether you maintained reasonable defensible space. It's becoming less of an option and more of a baseline expectation.",
      },
    ],
    faqs: [
      {
        q: "How often do I need to maintain defensible space?",
        a: "Annually, ideally before fire season peaks (March-June in Northwest Florida). Major brush clearing every 2-3 years; deadwood and seasonal cleanup every spring.",
      },
      {
        q: "Can I do this work myself?",
        a: "Light maintenance, sure. Major brush clearing, removing palmettos, or pruning lower limbs on tall pines is professional work — chainsaw injury rates spike during 'DIY defensible space season.'",
      },
      {
        q: "What does professional brush clearing cost?",
        a: "Highly variable — light clearing can run $500-$1,500 per acre. Dense palmetto and wax myrtle in mature pine canopy can run $3,000+ per acre. Free estimates after a walk-through.",
      },
    ],
    cta: {
      headline: "Want a wildfire-ready property?",
      body: "Free defensible-space assessment. We'll walk your property, identify your highest-risk fuel concentrations, and give you a clear plan and price.",
    },
    related: ["land-clearing-property-value", "yard-debris-pest-habitat", "hazard-tree-assessment-checklist"],
  },

  // 12
  {
    slug: "yard-debris-pest-habitat",
    cardTitle: "Yard Debris Hauling",
    title: "How Quickly a Debris Pile Becomes a Snake and Rodent Habitat in Florida",
    fact: "Piled yard debris becomes a snake and rodent habitat in under 2 weeks in Florida's climate.",
    excerpt:
      "That brush pile you've been meaning to deal with? It's a fully-functional snake and rodent ecosystem within about 14 days. Here's what to do instead.",
    readMinutes: 4,
    category: "Property",
    image: debrisRemoval,
    imageAlt: "Crew loading tree debris and branches for haul-away",
    intro:
      "We've all done it: a tree comes down, you stack the debris in 'a temporary pile out back,' and three months later it's still there. In Florida's warm, humid climate, what started as branches and leaves is now a functioning miniature ecosystem — and the residents include species you don't want close to your house. UF extension entomologists have documented the colonization sequence, and it happens faster than most homeowners realize.",
    sections: [
      {
        heading: "Day-by-day: what's living in your debris pile",
        body: "Days 1-3: insects move in (ants, roaches, beetles). Days 4-7: small reptiles arrive to eat the insects (skinks, anoles). Days 8-14: rodents move in for shelter and cover (palm rats, cotton rats, occasional opossums). Days 14-30: snakes follow the rodents (rat snakes, racers, and unfortunately sometimes copperheads or cottonmouths in our region). After 30 days you've got a stable miniature food chain — and it's all within walking distance of your back door.",
      },
      {
        heading: "Why brush piles are uniquely attractive habitat",
        body: "A brush pile offers everything wildlife needs: shelter from weather and predators, hiding spots for nesting, easy access to insect and rodent prey, and protection from heat. Florida's wildlife population is constantly looking for exactly these conditions, and a brush pile signals 'available housing' from a long way off. Even neat, contained piles attract wildlife — loose, tangled piles attract dramatically more.",
      },
      {
        heading: "The disposal options ranked",
        body: "Best: haul-away by a tree service (gone in one day, no risk). Good: chipping into mulch (kills habitat value, returns organic matter to your yard). Okay: stacking neatly at the curb for FEMA or municipal pickup (works if pickup is reliable). Bad: piling 'temporarily' in a back corner. Worst: open burning (legal in some unincorporated areas but creates fire risk and air quality issues).",
      },
      {
        heading: "What about composting?",
        body: "A managed compost pile is different from a brush pile. Compost requires regular turning, balanced inputs, and active decomposition that generates heat — most pests avoid it. A static brush pile is the opposite: cold, undisturbed, and full of cavities. If you want to compost yard waste, build a proper compost system. Otherwise, get the debris off the property.",
      },
      {
        heading: "Cost vs. risk",
        body: "Most residential debris haul-away in our service area runs $200-$600 depending on volume — far cheaper than a snake removal call, the cost of treating a rat infestation, or the medical cost of a venomous snake bite. We dispatch a dump trailer, load everything, sweep up the area, and you're done in a few hours.",
      },
    ],
    faqs: [
      {
        q: "What if I want to keep some logs for firewood?",
        a: "Stack firewood off the ground (on a rack or pallets), cover the top to keep it dry, and keep it at least 30 ft from the house. Pests still find firewood, but elevated covered stacks are dramatically less attractive than ground-level brush piles.",
      },
      {
        q: "Do you offer chipping instead of hauling?",
        a: "Yes — on-site chipping reduces volume and gives you free mulch. Costs less than full haul-away on smaller jobs.",
      },
      {
        q: "How fast can you come pick up debris?",
        a: "Usually within 3-5 business days for non-storm-related work. After major storms, scheduling is longer.",
      },
    ],
    cta: {
      headline: "Got a pile of yard debris staring at you?",
      body: "We'll haul it all in one visit. Free quote, dump trailer included, and your yard back to pest-free. Call (518) 265-0275.",
    },
    related: ["stumps-attract-termites", "hurricane-tree-debris-cleanup", "brush-wildfire-defensible-space"],
  },
];

export const BLOG_BY_SLUG = Object.fromEntries(BLOG_POSTS.map((p) => [p.slug, p]));
export const BLOG_BY_CARD_TITLE = Object.fromEntries(BLOG_POSTS.map((p) => [p.cardTitle, p]));
