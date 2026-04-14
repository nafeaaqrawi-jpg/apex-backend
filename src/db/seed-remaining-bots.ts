/**
 * Seeds prompts for the 90 extra-bot profiles created by extra-bots-seed.ts.
 * Each bot gets 3 prompts tailored to their background, field, and personality.
 * Run: npm run db:seed-remaining-bots
 */
import { db } from '../lib/db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { BOT_EMAIL_DOMAIN } from '../lib/bots';

interface PromptEntry {
  question: string;
  answer: string;
  photoUrl?: string;
  voiceUrl?: string | null;
}

interface BotPromptDef {
  email: string;
  prompts: PromptEntry[];
}

const botPrompts: BotPromptDef[] = [
  // ── Women ──────────────────────────────────────────────────────────────────

  {
    email: `zoe.anderson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The research I keep thinking about:',
        answer: "Kahneman's work on experienced vs. remembered happiness. We optimize for the wrong thing constantly and I find that both troubling and useful.",
        photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
      {
        question: 'What I actually study when I study psychology:',
        answer: "Why smart people make predictably bad decisions. Spoiler: it's not stupidity, it's incentive structures.",
      },
      {
        question: 'Green flag I look for immediately:',
        answer: "You have a genuine opinion about something obscure and you'll defend it without getting defensive.",
        photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
    ],
  },

  {
    email: `lily.park${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The film that changed how I think:',
        answer: "Wong Kar-wai's In the Mood for Love. It convinced me that longing is more interesting than resolution.",
        photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
      },
      {
        question: "What I'm writing right now:",
        answer: "A short film about a translator who's slowly losing her native language. It's about more than language.",
      },
      {
        question: 'I need someone who understands that:',
        answer: "The subway isn't a downgrade. It's the only way to actually live in a city.",
        photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
      },
    ],
  },

  {
    email: `isabella.torres${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What I'm building right now:",
        answer: 'A sustainable fashion marketplace that actually pays the supply chain fairly. Not a side project — a real company.',
        photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
      },
      {
        question: 'Unpopular opinion in my field:',
        answer: "Most MBAs teach you to manage things that already exist. The interesting work is creating things that don't.",
      },
      {
        question: 'My version of a perfect Saturday:',
        answer: 'Farmers market at 8am, product pitch deck by noon, a long trail run at 4pm. Non-negotiable.',
        photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
      },
    ],
  },

  {
    email: `ava.johnson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The conversation I keep having:',
        answer: "Whether caring deeply about patients is a strength or something the healthcare system will eventually train out of you. I'm choosing to believe it's a strength.",
        photoUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
      },
      {
        question: "I'll always say yes to:",
        answer: "Farmers markets, live music that wasn't advertised, and anyone with a genuinely good recommendation.",
      },
      {
        question: 'What people get wrong about nursing:',
        answer: "That it's a stepping stone to medicine. It's its own discipline. The best nurses see things doctors miss.",
        photoUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
      },
    ],
  },

  {
    email: `mia.chen${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'My thesis in one sentence:',
        answer: "The laws of physics are the only things that are genuinely non-negotiable. Everything else is negotiable.",
        photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
      },
      {
        question: "Two truths and a lie about being a physics major:",
        answer: "I can derive Maxwell's equations from memory. I understand what a Calabi-Yau manifold is. I enjoy explaining my research at parties.",
      },
      {
        question: 'What I actually do for fun:',
        answer: "Chess, hiking, and cooking elaborate meals that require precise timing. Turns out physics transfers.",
        photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
      },
    ],
  },

  {
    email: `chloe.kim${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What I mean when I say something is well-designed:',
        answer: "It solves the actual problem, not the stated problem. Most people don't know what they need until they have it.",
        photoUrl: 'https://randomuser.me/api/portraits/women/7.jpg',
      },
      {
        question: 'My creative outlet that has nothing to do with screens:',
        answer: 'Ceramics. The imprecision is the point. You cannot iterate on clay in Figma.',
      },
      {
        question: "I'm unreasonably good at:",
        answer: "Knowing within 30 seconds if a UI was designed by someone who actually uses the product.",
        photoUrl: 'https://randomuser.me/api/portraits/women/7.jpg',
      },
    ],
  },

  {
    email: `natalie.brooks${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The region I'm currently obsessed with:",
        answer: "The Sahel. The geopolitical complexity per square mile is unlike anything else on the continent. Most people couldn't find it on a map.",
        photoUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
      },
      {
        question: 'What living in three countries teaches you:',
        answer: "That your own assumptions are almost always invisible until you leave.",
      },
      {
        question: 'The language I wish I spoke fluently:',
        answer: "Swahili. Working on it. Slowly.",
        photoUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
      },
    ],
  },

  {
    email: `hannah.lee${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The economic concept I think about most in real life:',
        answer: "Revealed preferences. What people do tells you far more than what they say they value.",
        photoUrl: 'https://randomuser.me/api/portraits/women/9.jpg',
      },
      {
        question: 'Where I do my best thinking:',
        answer: "Shenandoah Valley, first two miles of a trail run, before my internal monologue starts up again.",
      },
      {
        question: 'I need someone who understands that:',
        answer: "A real conversation is not the same thing as talking at each other in the same room.",
        photoUrl: 'https://randomuser.me/api/portraits/women/9.jpg',
      },
    ],
  },

  {
    email: `abigail.wright${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'My unpopular opinion in public health:',
        answer: "Behavior change campaigns almost never work. Systems change does. We have the causality backwards.",
        photoUrl: 'https://randomuser.me/api/portraits/women/10.jpg',
      },
      {
        question: 'The policy argument I will always show up for:',
        answer: "Healthcare as infrastructure vs. healthcare as a market. I have a position and it is not moderate.",
      },
      {
        question: 'What I do when I actually need to decompress:',
        answer: "Yoga, long fiction, and watching documentary films about topics I know nothing about.",
        photoUrl: 'https://randomuser.me/api/portraits/women/10.jpg',
      },
    ],
  },

  {
    email: `evelyn.martinez${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The project that keeps me up at night:',
        answer: "Designing mixed-use spaces that actually work for the people who live there, not the people who photograph them.",
        photoUrl: 'https://randomuser.me/api/portraits/women/11.jpg',
      },
      {
        question: 'What I sketch on when there are no notebooks:',
        answer: "Napkins, receipts, the back of my hand. Everything is a drawing surface when you're working on a problem.",
      },
      {
        question: 'The building that changed how I see architecture:',
        answer: "The Kimbell Art Museum. Kahn got light right in a way that hasn't been surpassed.",
        photoUrl: 'https://randomuser.me/api/portraits/women/11.jpg',
      },
    ],
  },

  {
    email: `sophia.liu${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What I'm working on in the lab:",
        answer: "Lipid nanoparticle delivery systems for targeted cancer therapy. It's genuinely exciting and I'm allowed to say that.",
        photoUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
      },
      {
        question: 'My comfort activity that makes no scientific sense:',
        answer: "Baking. I follow no recipes. It works about 65% of the time. I have accepted this.",
      },
      {
        question: 'I need someone who understands that:',
        answer: "Being passionate about your work is not the same as not having a life outside of it. I have both.",
        photoUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
      },
    ],
  },

  {
    email: `grace.williams${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The reason I chose pre-med over research:',
        answer: "I want to be the person in the room with the patient, not just the paper. The research matters but the face matters more.",
        photoUrl: 'https://randomuser.me/api/portraits/women/13.jpg',
      },
      {
        question: 'How I actually manage the workload:',
        answer: "Early mornings, long runs, and sourdough that I bake on Sundays whether I have time or not. Discipline looks like ritual.",
      },
      {
        question: "I'll always say yes to:",
        answer: "Anything that gets me outdoors and tired before 9am.",
        photoUrl: 'https://randomuser.me/api/portraits/women/13.jpg',
      },
    ],
  },

  {
    email: `lauren.thompson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The beat I cover that matters most:',
        answer: "How tech platforms decide what is and isn't speech. Most people don't realize how consequential these decisions are.",
        photoUrl: 'https://randomuser.me/api/portraits/women/14.jpg',
      },
      {
        question: 'My media criticism habit in one sentence:',
        answer: "I cannot watch a documentary without thinking about what was left out.",
      },
      {
        question: 'What I look for in a good conversation:',
        answer: "Someone who can disagree with my argument on its actual merits, not because it makes them uncomfortable.",
        photoUrl: 'https://randomuser.me/api/portraits/women/14.jpg',
      },
    ],
  },

  {
    email: `ella.robinson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What hospitality actually is:',
        answer: "The deliberate management of how someone feels — before they walk in, while they're there, and after they leave. Most people only think about the middle part.",
        photoUrl: 'https://randomuser.me/api/portraits/women/15.jpg',
      },
      {
        question: "The best meal I've had this year:",
        answer: "A tiny pasta place in the West Village where the chef came out to argue about carbonara. I agreed with him.",
      },
      {
        question: "I'm unreasonably good at:",
        answer: "Reading a table within two minutes of sitting down — who wants attention, who wants space, who is on a first date.",
        photoUrl: 'https://randomuser.me/api/portraits/women/15.jpg',
      },
    ],
  },

  {
    email: `zoey.clark${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'Why I doubled in business and CS:',
        answer: "Because I kept watching engineers build the wrong thing and businesspeople who couldn't evaluate what the engineers were building. I wanted to be the translator.",
        photoUrl: 'https://randomuser.me/api/portraits/women/16.jpg',
      },
      {
        question: "The startup I'd build if I had to start tomorrow:",
        answer: "Infrastructure for carbon accounting that doesn't require a 6-person compliance team to operate.",
      },
      {
        question: 'Saturday morning, no obligations:',
        answer: "Long hike, good coffee, and a meal I actually cooked — ideally for someone worth cooking for.",
        photoUrl: 'https://randomuser.me/api/portraits/women/16.jpg',
      },
    ],
  },

  {
    email: `aubrey.lewis${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What environmental studies actually is at Dartmouth:',
        answer: "Half policy, half field science, all arguing about what we owe future people who can't vote. I find that clarifying.",
        photoUrl: 'https://randomuser.me/api/portraits/women/17.jpg',
      },
      {
        question: "My trail running philosophy:",
        answer: "Go out far enough that turning back is no longer the easier option. Applied to most decisions.",
      },
      {
        question: "The wildlife photo I'm most embarrassed by:",
        answer: "A blurry smear that is allegedly a pine marten. Still submitted it. Not proud.",
        photoUrl: 'https://randomuser.me/api/portraits/women/17.jpg',
      },
    ],
  },

  {
    email: `aria.walker${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What drew me to infectious disease:",
        answer: "The transmission dynamics. The way a pathogen moves through a population tells you everything about the population's structure.",
        photoUrl: 'https://randomuser.me/api/portraits/women/18.jpg',
      },
      {
        question: "I'll always say yes to:",
        answer: "A yoga class that actually challenges me, a new playlist, or a question I've been avoiding.",
      },
      {
        question: 'The thing I tell people about lab work that surprises them:',
        answer: "Most of it is waiting. You get very good at reading during incubation.",
        photoUrl: 'https://randomuser.me/api/portraits/women/18.jpg',
      },
    ],
  },

  {
    email: `nora.hall${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What I believe about scale:',
        answer: "Some of the most important work doesn't scale and never should. The intimacy is the mechanism.",
        photoUrl: 'https://randomuser.me/api/portraits/women/19.jpg',
      },
      {
        question: 'The book that shaped how I practice:',
        answer: "Toni Morrison's Beloved. Not a social work manual — but it taught me more about bearing witness than anything in my program.",
      },
      {
        question: 'What I need in a relationship:',
        answer: "Someone who understands that my work is emotionally demanding and knows the difference between processing and venting.",
        photoUrl: 'https://randomuser.me/api/portraits/women/19.jpg',
      },
    ],
  },

  {
    email: `riley.young${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'My focus within East Asian security:',
        answer: "Cross-strait deterrence and why the Taiwan Strait is the most important maritime corridor most Americans still underestimate.",
        photoUrl: 'https://randomuser.me/api/portraits/women/20.jpg',
      },
      {
        question: 'How I keep my opinions civil at dinner:',
        answer: "I ask questions first. Usually by the time I've understood the other position, I'm less certain of my own.",
      },
      {
        question: 'The language I learned entirely for professional reasons and now love:',
        answer: "Mandarin. Started as a credential. Became a genuine obsession.",
        photoUrl: 'https://randomuser.me/api/portraits/women/20.jpg',
      },
    ],
  },

  {
    email: `madison.harris${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What brand strategy actually is:',
        answer: "Deciding what a company is willing to be unpopular for. The rest is just execution.",
        photoUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
      },
      {
        question: "The campaign I'm proudest of:",
        answer: "A brand relaunch for a women's health startup that grew 40% in six months. The brief said 'professional.' We went warm instead.",
      },
      {
        question: "I'm unreasonably good at:",
        answer: "Pasta. From scratch. For people I actually want to impress.",
        photoUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
      },
    ],
  },

  {
    email: `charlotte.white${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What New Orleans adds to pre-med:',
        answer: "Constant exposure to what happens when public health infrastructure collapses. Better education than any lecture.",
        photoUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      },
      {
        question: 'The energy I want in a partner:',
        answer: "Someone who moves through the city the way locals do — with intention, without the map.",
      },
      {
        question: 'Why I chose Tulane over somewhere more recognizable:',
        answer: "I wanted to learn medicine in a place that would teach me about the actual conditions people live in. Glad I did.",
        photoUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      },
    ],
  },

  {
    email: `layla.scott${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What I'm building in backend right now:",
        answer: "A distributed job queue with exactly-once delivery guarantees. Harder than it sounds, which is why I like it.",
        photoUrl: 'https://randomuser.me/api/portraits/women/23.jpg',
      },
      {
        question: 'What bad UI actually costs:',
        answer: "User trust. Once you lose it you don't get it back with a redesign. You build it right the first time.",
      },
      {
        question: "Where I go when Austin gets loud:",
        answer: "Enchanted Rock. Two hours west, zero cell service, and problems that feel smaller from a granite dome.",
        photoUrl: 'https://randomuser.me/api/portraits/women/23.jpg',
      },
    ],
  },

  {
    email: `penelope.green${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The question I think about most:',
        answer: "Whether language shapes thought or thought shapes language — and what we lose in translation between the two.",
        photoUrl: 'https://randomuser.me/api/portraits/women/24.jpg',
      },
      {
        question: 'What Wittgenstein actually said that matters:',
        answer: "The limits of my language mean the limits of my world. Most people quote this. Fewer live as if it's true.",
      },
      {
        question: 'What I look for in a conversation:',
        answer: "Someone who can follow a thought to its uncomfortable conclusion and not need to stop at the comfortable part.",
        photoUrl: 'https://randomuser.me/api/portraits/women/24.jpg',
      },
    ],
  },

  {
    email: `stella.baker${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What industrial engineering taught me about cooking:',
        answer: "Variance is the enemy. Master the process and the result is consistent. Most people focus on the result and wonder why it's inconsistent.",
        photoUrl: 'https://randomuser.me/api/portraits/women/25.jpg',
      },
      {
        question: 'The system I optimized that surprised me most:',
        answer: "My own morning routine. Eliminated 40 minutes of wasted decision time. Sounds clinical. Changed my life.",
      },
      {
        question: 'I need someone who understands that:',
        answer: "Precision and warmth are not opposites. I am very exact and also very loyal. These things coexist.",
        photoUrl: 'https://randomuser.me/api/portraits/women/25.jpg',
      },
    ],
  },

  {
    email: `violet.adams${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The story I want to tell one day:',
        answer: "The untold history of a small American city that everyone overlooks. The drama is always local.",
        photoUrl: 'https://randomuser.me/api/portraits/women/26.jpg',
      },
      {
        question: 'My podcast diet:',
        answer: "In Our Time, Radiolab, and two political ones I won't name because I don't want to be categorized on the first date.",
      },
      {
        question: 'What I look for in someone:',
        answer: "Genuine curiosity about things outside their lane. A lawyer who reads poetry. An engineer who asks historical questions.",
        photoUrl: 'https://randomuser.me/api/portraits/women/26.jpg',
      },
    ],
  },

  {
    email: `luna.nelson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'Why I chose environmental science over policy:',
        answer: "Because if you don't understand the underlying system, your policy is just guessing with formal language.",
        photoUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
      },
      {
        question: "My trail running rule:",
        answer: "Always go further than you planned to. The extra mile is where the view actually is.",
      },
      {
        question: 'What living in the Pacific Northwest does to you:',
        answer: "You stop being able to live without mountains within an hour. This is both wonderful and a logistical problem.",
        photoUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
      },
    ],
  },

  {
    email: `scarlett.carter${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What finance actually teaches you:',
        answer: "How to be comfortable with uncertainty while still making a decision. Most people can only do one of those.",
        photoUrl: 'https://randomuser.me/api/portraits/women/29.jpg',
      },
      {
        question: 'The thing that surprised me about my internship:',
        answer: "How much of investment decisions are about reading people, not models. The models are just the excuse.",
      },
      {
        question: 'What I want in a relationship:',
        answer: "Someone who means what they say and doesn't need to be decoded. Direct communication is underrated.",
        photoUrl: 'https://randomuser.me/api/portraits/women/29.jpg',
      },
    ],
  },

  {
    email: `hazel.mitchell${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What being on co-op taught me that school didn\'t:',
        answer: "Clients don't always know what they want, but they always know what they don't want. Start there.",
        photoUrl: 'https://randomuser.me/api/portraits/women/30.jpg',
      },
      {
        question: "I'm unreasonably bothered by:",
        answer: "Misaligned visual hierarchy. I cannot unsee it once I've seen it. In apps, in print, in menus.",
      },
      {
        question: "What I'm working on right now outside of class:",
        answer: "A typeface project I started six months ago and keep almost finishing. Perfection is the enemy.",
        photoUrl: 'https://randomuser.me/api/portraits/women/30.jpg',
      },
    ],
  },

  {
    email: `aurora.roberts${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What interning on the Hill taught me:',
        answer: "That the gap between what politicians believe and what they're willing to say in public is where everything actually happens.",
        photoUrl: 'https://randomuser.me/api/portraits/women/31.jpg',
      },
      {
        question: 'How I stay sane surrounded by DC energy:',
        answer: "Early morning runs before the city wakes up, long fiction, and dinner with people who have nothing to do with politics.",
      },
      {
        question: 'The political science argument I will always show up for:',
        answer: "Whether institutions constrain power or just launder it. Still working on my answer.",
        photoUrl: 'https://randomuser.me/api/portraits/women/31.jpg',
      },
    ],
  },

  {
    email: `ellie.turner${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What I'm researching in ML right now:",
        answer: "Interpretability — specifically why neural networks work as well as they do on tasks we don't fully understand. It bothers me that we don't know.",
        photoUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
      },
      {
        question: 'Why I rock climb:',
        answer: "It's the only activity where the problem-solving part of my brain and the physical part have to work simultaneously. Extremely efficient.",
      },
      {
        question: 'The thing I want in a partner above everything else:',
        answer: "Genuine intellectual curiosity. Not performative. The kind that makes you pick up a book about something that has no career value.",
        photoUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
      },
    ],
  },

  {
    email: `cora.phillips${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What statistics actually is:',
        answer: "The discipline of being honest about what you don't know while still being useful. Most people skip the honest part.",
        photoUrl: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
      {
        question: 'The pattern I find most interesting in human data:',
        answer: "How consistently people's choices reveal preferences they would deny having if you asked them directly.",
      },
      {
        question: 'My version of a perfect evening:',
        answer: "Good food, a film that requires something of me, and a conversation that goes somewhere unexpected.",
        photoUrl: 'https://randomuser.me/api/portraits/women/34.jpg',
      },
    ],
  },

  {
    email: `piper.campbell${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What brand strategy actually is:',
        answer: "Knowing what to say no to. Any brand that says yes to everything says nothing.",
        photoUrl: 'https://randomuser.me/api/portraits/women/35.jpg',
      },
      {
        question: 'My hot take on wellness culture:',
        answer: "Yoga and farmers markets are fine. The problem is when they become identity instead of habit.",
      },
      {
        question: 'What I look for immediately:',
        answer: "Someone with genuine taste — not expensive taste, but considered taste. The ability to have a reason for what they like.",
        photoUrl: 'https://randomuser.me/api/portraits/women/35.jpg',
      },
    ],
  },

  {
    email: `naomi.evans${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What adolescent psychology taught me about myself:',
        answer: "That most of what we think of as adult behavior is just adolescent coping mechanisms that got formalized. I find this clarifying.",
        photoUrl: 'https://randomuser.me/api/portraits/women/36.jpg',
      },
      {
        question: 'My beach philosophy:',
        answer: "Two hours minimum. No phone for the first one. Book for the second. This is not negotiable.",
      },
      {
        question: 'I need someone who understands that:',
        answer: "Empathy is not softness. It's the most accurate tool for understanding why people do what they do.",
        photoUrl: 'https://randomuser.me/api/portraits/women/36.jpg',
      },
    ],
  },

  {
    email: `camille.edwards${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The constitutional question I can't stop thinking about:",
        answer: "What the founders actually meant by 'commerce' and how much of modern doctrine would collapse if we took that seriously.",
        photoUrl: 'https://randomuser.me/api/portraits/women/37.jpg',
      },
      {
        question: 'How I debate at Notre Dame:',
        answer: "I prepare the strongest version of the opposing argument before I build my own. You can't beat something you haven't understood.",
      },
      {
        question: 'What I look for above everything else:',
        answer: "Someone who listens to understand, not to respond. Rarer than it should be.",
        photoUrl: 'https://randomuser.me/api/portraits/women/37.jpg',
      },
    ],
  },

  {
    email: `vivienne.collins${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The argument I always win:',
        answer: "That literary fiction is the best tool we have for understanding consciousness. Neuroscience is catching up slowly.",
        photoUrl: 'https://randomuser.me/api/portraits/women/38.jpg',
      },
      {
        question: 'The writer I assign to everyone I meet:',
        answer: "Marilynne Robinson. Start with Gilead. Come back and tell me I'm wrong.",
      },
      {
        question: "I'm not a snob about:",
        answer: "Genre. I've learned more from crime fiction about how cities actually work than from most literary novels about cities.",
        photoUrl: 'https://randomuser.me/api/portraits/women/38.jpg',
      },
    ],
  },

  {
    email: `iris.stewart${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The physics problem I think about in the shower:",
        answer: "Why the arrow of time only points one direction when the fundamental equations of physics work equally well in both directions.",
        photoUrl: 'https://randomuser.me/api/portraits/women/39.jpg',
      },
      {
        question: 'What I look for in a conversation:',
        answer: "Someone who asks the question after the question. Most people stop at the first interesting one.",
      },
      {
        question: 'The compliment I hear most often that I find most accurate:',
        answer: "That I make hard things feel approachable. I've decided that's worth more than being intimidating.",
        photoUrl: 'https://randomuser.me/api/portraits/women/39.jpg',
      },
    ],
  },

  {
    email: `stella.morales${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What neuro research actually looks like day to day:",
        answer: "Long incubations, small signals, and the occasional result that contradicts everything you thought you knew. I love it.",
        photoUrl: 'https://randomuser.me/api/portraits/women/40.jpg',
      },
      {
        question: 'The recipe I will never write down:',
        answer: "My grandmother's tamales. It's measured in judgment, not cups. I'm learning to read the judgment.",
      },
      {
        question: "Stanford gave me:",
        answer: "A network I'll use forever and the self-awareness to know that the network is not the education.",
        photoUrl: 'https://randomuser.me/api/portraits/women/40.jpg',
      },
    ],
  },

  {
    email: `faye.rivera${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What curatorial work is really about:',
        answer: "Deciding what a culture thinks is worth preserving. That's not a neutral decision and I take it seriously.",
        photoUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
      },
      {
        question: 'The painting I keep coming back to:',
        answer: "Velázquez's Las Meninas. The structure of gazes in that painting is more complex than most films.",
      },
      {
        question: 'Why I chose Brown over somewhere more pre-professional:',
        answer: "I needed four years to think seriously about what I actually believe, not just what I could be hired to say.",
        photoUrl: 'https://randomuser.me/api/portraits/women/41.jpg',
      },
    ],
  },

  {
    email: `celeste.murphy${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The consciousness question that keeps me up:",
        answer: "Whether there's something it's like to be an octopus. I think there is. The implications are significant.",
        photoUrl: 'https://randomuser.me/api/portraits/women/42.jpg',
      },
      {
        question: 'How I decompress after a hard week in the lab:',
        answer: "A long run with a playlist I made myself. The effort of making the playlist is half the point.",
      },
      {
        question: 'What I look for first in a person:',
        answer: "Genuine curiosity. About things that don't benefit them. About things they'll never be able to use.",
        photoUrl: 'https://randomuser.me/api/portraits/women/42.jpg',
      },
    ],
  },

  {
    email: `willow.cooper${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What directing is that acting isn't:",
        answer: "The whole thing. The actor inhabits the story. The director builds the world the story inhabits.",
        photoUrl: 'https://randomuser.me/api/portraits/women/43.jpg',
      },
      {
        question: "The play that changed how I work:",
        answer: "Chekhov's The Cherry Orchard. Every character is right and nobody is listening. I think about that every day.",
      },
      {
        question: "I'm unreasonably good at:",
        answer: "Listening. Actually listening — not waiting to speak. Most people can't do this and don't know they can't.",
        photoUrl: 'https://randomuser.me/api/portraits/women/43.jpg',
      },
    ],
  },

  {
    email: `adelaide.howard${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What Wharton gets right that nobody talks about:',
        answer: "It teaches you to be comfortable with ambiguity at scale. The analysis is a tool. The judgment is on you.",
        photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      {
        question: 'My honest take on finance culture:',
        answer: "The arrogance is a defense mechanism. The people who drop it are usually the most interesting ones.",
      },
      {
        question: 'I need someone who understands that:',
        answer: "I compete hard at work and lead with kindness everywhere else. These are both real.",
        photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
    ],
  },

  {
    email: `sabrina.ward${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'The design principle I live by:',
        answer: "Remove until it breaks. Then add back exactly one thing.",
        photoUrl: 'https://randomuser.me/api/portraits/women/46.jpg',
      },
      {
        question: 'The grocery store experience as told by a CMU design student:',
        answer: "Deeply hostile UX, tragic wayfinding, and packaging designed to confuse. I have written a 12-page analysis. Yes, really.",
      },
      {
        question: 'What I want from someone I date:',
        answer: "Genuine taste. Not expensive taste. Considered taste. Someone who has a reason for what they like.",
        photoUrl: 'https://randomuser.me/api/portraits/women/46.jpg',
      },
    ],
  },

  {
    email: `beatrice.reed${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'What my short films are actually about:',
        answer: "Displacement — people who are somewhere they don't belong and can't name why. My third one is the best so far.",
        photoUrl: 'https://randomuser.me/api/portraits/women/47.jpg',
      },
      {
        question: "The director I argue with most in my head:",
        answer: "Paul Thomas Anderson. I think he's brilliant and I think he wastes at least 20 minutes per film. Both things are true.",
      },
      {
        question: 'I see narrative in:',
        answer: "The way someone orders at a restaurant. The first thing they say when they pick up a call. The way they say goodbye.",
        photoUrl: 'https://randomuser.me/api/portraits/women/47.jpg',
      },
    ],
  },

  {
    email: `rosalind.fleming${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: 'My water policy focus in one sentence:',
        answer: "The next major geopolitical conflicts won't be over oil. They'll be over freshwater allocation.",
        photoUrl: 'https://randomuser.me/api/portraits/women/48.jpg',
      },
      {
        question: "Trail running philosophy:",
        answer: "Don't optimize for speed. Optimize for finishing in a state where you want to do it again.",
      },
      {
        question: 'What Berkeley does to your politics:',
        answer: "It makes you realize your assumptions were always assumptions. That's uncomfortable and necessary.",
        photoUrl: 'https://randomuser.me/api/portraits/women/48.jpg',
      },
    ],
  },

  {
    email: `margot.gray${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The building I've spent the most time in that I love:",
        answer: "The Yale Art and Architecture building. Paul Rudolph designed something that looks exactly like how thinking feels.",
        photoUrl: 'https://randomuser.me/api/portraits/women/49.jpg',
      },
      {
        question: 'My strong opinion about coffee shops:',
        answer: "The best ones have natural light, no playlist I can identify, and tables big enough to actually work at.",
      },
      {
        question: 'What architecture school teaches you about people:',
        answer: "That how a space is organized shapes what conversations are possible in it. I design for better conversations.",
        photoUrl: 'https://randomuser.me/api/portraits/women/49.jpg',
      },
    ],
  },

  // ── Men ────────────────────────────────────────────────────────────────────

  {
    email: `liam.cooper${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "My constitutional law fixation in one sentence:",
        answer: "The founding text was designed to be interpreted, not decoded. Every era gets the constitution it argues for.",
        photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      {
        question: "Why I argue positions I don't believe:",
        answer: "Because you can't defeat an argument you haven't actually made. I stress-test ideas the way engineers stress-test bridges.",
      },
      {
        question: 'What I look for in a conversation partner:',
        answer: "Someone willing to change their mind when the argument is good. Not often, not easily — but when it genuinely earns it.",
        photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
    ],
  },

  {
    email: `noah.martinez${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The physics concept that changed how I live:",
        answer: "Entropy. The universe trends toward disorder not because something goes wrong but because disorder is more probable. I find that liberating.",
        photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
      {
        question: 'What quantum mechanics is actually like at Stanford:',
        answer: "Humbling. The math is beautiful and what it implies about reality is either profound or deeply unsettling. Usually both.",
      },
      {
        question: 'What the big questions do to everyday life:',
        answer: "Make the small things feel lighter. Also make certain arguments feel very small. I've become a better listener.",
        photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    ],
  },

  {
    email: `mason.thompson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What electrical engineering actually is at MIT:",
        answer: "The discipline of making things work reliably at scale. Most problems are not interesting problems — they're reliability problems in disguise.",
        photoUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
      {
        question: "The non-technical skill I'm most proud of:",
        answer: "Making good conversation across disciplines. Engineers who can only talk to engineers are a liability.",
      },
      {
        question: "I'll always say yes to:",
        answer: "Cooking for people, cycling somewhere I haven't been, or a live music set I didn't plan on.",
        photoUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
    ],
  },

  {
    email: `elijah.anderson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "My political theory position in one sentence:",
        answer: "Liberal democracy is not inevitable. It requires active maintenance by people willing to defend it when it's inconvenient.",
        photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
      },
      {
        question: 'The tension I hold simultaneously:',
        answer: "Deep belief in institutions and clear-eyed recognition of their failures. These are not contradictions — they're the job.",
      },
      {
        question: 'What Yale law prep actually looks like:',
        answer: "Reading 80 pages a night and arguing about it the next morning. I've become a significantly better thinker. Also more exhausted.",
        photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
      },
    ],
  },

  {
    email: `oliver.davis${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The economic model I actually trust:",
        answer: "None completely. That's not cynicism — that's what economists mean when they say 'all models are wrong, some are useful.'",
        photoUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
      },
      {
        question: 'What modeling for fun looks like:',
        answer: "Building toy models of interesting systems — traffic, social networks, auctions — to see if the math matches the intuition.",
      },
      {
        question: "I'm unreasonably good at:",
        answer: "Explaining why something that seems counterintuitive is actually exactly what the theory predicts.",
        photoUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
      },
    ],
  },

  {
    email: `jacob.wilson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "Why emerging markets, not Wall Street's usual focus:",
        answer: "Because the interesting risk is where the pricing is wrong, not where the models are most confident.",
        photoUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
      },
      {
        question: "What living in three countries teaches you about finance:",
        answer: "That money is always political and pretending otherwise is how you get surprised.",
      },
      {
        question: "The city I'm most likely to end up in:",
        answer: "Singapore or Dubai for five years, then somewhere with actual seasons. The math on that trade-off still works.",
        photoUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
      },
    ],
  },

  {
    email: `william.taylor${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What Wharton marketing actually teaches:",
        answer: "How to understand what someone wants before they can articulate it. This is useful everywhere, not just in business.",
        photoUrl: 'https://randomuser.me/api/portraits/men/8.jpg',
      },
      {
        question: "The brand that gets it right and why:",
        answer: "Patagonia. They are clear about what they stand against, which is harder and more effective than being clear about what you stand for.",
      },
      {
        question: 'What I actually want:',
        answer: "Someone who is building something they care about. The subject doesn't matter — the conviction does.",
        photoUrl: 'https://randomuser.me/api/portraits/men/8.jpg',
      },
    ],
  },

  {
    email: `james.brown${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What reading the research actually changes:",
        answer: "Your tolerance for clinical confidence. Most recommendations have weaker evidence behind them than patients realize. I think patients deserve to know that.",
        photoUrl: 'https://randomuser.me/api/portraits/men/9.jpg',
      },
      {
        question: "How I take things at about a 7/10:",
        answer: "I care about medicine deeply and almost everything else lightly. This is a deliberate choice, not indifference.",
      },
      {
        question: 'What I cook when I need to decompress:',
        answer: "One-pot dishes. Braises. Anything that requires patience but not precision.",
        photoUrl: 'https://randomuser.me/api/portraits/men/9.jpg',
      },
    ],
  },

  {
    email: `henry.jackson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What longform journalism is really about:",
        answer: "Giving someone enough context to hold a true opinion. Most news doesn't do this. I want to fix that.",
        photoUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
      },
      {
        question: 'What covering technology taught me about people:',
        answer: "That the people building the future are rarely the ones thinking hardest about whether they should.",
      },
      {
        question: "I'm learning to be honest about:",
        answer: "The difference between being right in a piece and being right in a conversation. Different skills. Working on both.",
        photoUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
      },
    ],
  },

  {
    email: `sebastian.white${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "Quantum tunneling explained without math:",
        answer: "A particle behaves like it borrowed energy from the future to get past a barrier it shouldn't be able to cross. The universe is stranger than we were told.",
        photoUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
      },
      {
        question: 'Why I bake bread:',
        answer: "Because the chemistry is precise and the process is forgiving and the result is something you can give someone.",
      },
      {
        question: 'What I want in a person:',
        answer: "Someone who can hold wonder without neediness. The universe is extraordinary — I want someone who notices.",
        photoUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
      },
    ],
  },

  {
    email: `jack.harris${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The philosophical problem I actually argue about:",
        answer: "Moral realism. Whether there are facts about ethics independent of any mind. I think there are. Brown mostly disagrees.",
        photoUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
      },
      {
        question: 'How I handle going too far in an argument:',
        answer: "I apologize directly and specifically. Not 'I'm sorry if you felt' — I say what I did and why it was wrong.",
      },
      {
        question: 'What I look for in someone:',
        answer: "Someone who argues to get closer to true, not to win. I can tell within five minutes which one you're doing.",
        photoUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
      },
    ],
  },

  {
    email: `luke.martin${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What urbanism taught me about relationships:",
        answer: "Proximity and density create connection, but the design of the space determines the quality of that connection.",
        photoUrl: 'https://randomuser.me/api/portraits/men/13.jpg',
      },
      {
        question: 'The city I study when I want to understand what went right:',
        answer: "Bologna. Pedestrian-first, mixed-use, genuinely livable since the 1970s. We keep rediscovering the same solution.",
      },
      {
        question: "My coffee snobbery in one sentence:",
        answer: "Single origin, V60, no flavored syrups within 20 feet. I am not apologizing for this.",
        photoUrl: 'https://randomuser.me/api/portraits/men/13.jpg',
      },
    ],
  },

  {
    email: `benjamin.garcia${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What decision-making research taught me about myself:",
        answer: "That I'm vulnerable to the same biases I study, and knowing about them only helps about 30% of the time. Still useful.",
        photoUrl: 'https://randomuser.me/api/portraits/men/14.jpg',
      },
      {
        question: 'Why psychology at Vanderbilt:',
        answer: "Because understanding why people do what they do is the most generalizable skill there is.",
      },
      {
        question: "I'm drawn to people who:",
        answer: "Have an explanation for their behavior that goes beyond 'I don't know, I just do.' Self-knowledge is rare and I find it attractive.",
        photoUrl: 'https://randomuser.me/api/portraits/men/14.jpg',
      },
    ],
  },

  {
    email: `wyatt.miller${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What music composition and computer science have in common:",
        answer: "Both require you to find the structure that makes something feel inevitable in retrospect. The insight precedes the execution.",
        photoUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
      },
      {
        question: "What I'm scoring right now:",
        answer: "A short film about a woman who returns to her childhood home and finds someone else living in it. The music is mostly silence.",
      },
      {
        question: 'My defense of Houston:',
        answer: "It's the most international city in America by some measures, it has the best food per dollar, and you can afford to actually live there.",
        photoUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
      },
    ],
  },

  {
    email: `carter.moore${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What venture taught me that business school didn't:",
        answer: "Timing is more important than quality. A great product at the wrong time is just a failed company with a good post-mortem.",
        photoUrl: 'https://randomuser.me/api/portraits/men/16.jpg',
      },
      {
        question: "The idea I keep coming back to:",
        answer: "A marketplace for physical skills — plumbing, carpentry, welding — that makes trade apprenticeships as legible as coding bootcamps.",
      },
      {
        question: 'How I actually switch off:',
        answer: "Completely. No half-measures. Outdoors, phone in the bag, until I can think about the problem fresh.",
        photoUrl: 'https://randomuser.me/api/portraits/men/16.jpg',
      },
    ],
  },

  {
    email: `caden.taylor${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "My Middle East policy position:",
        answer: "The Abraham Accords shifted the regional architecture in ways most Western analysts are still catching up with.",
        photoUrl: 'https://randomuser.me/api/portraits/men/17.jpg',
      },
      {
        question: "Why I learned Arabic:",
        answer: "Because you can't understand a region through translations and press releases. I wanted to read the primary sources.",
      },
      {
        question: 'What I want in someone I date:',
        answer: "Genuine intellectual independence — their own framework, not inherited from their social environment.",
        photoUrl: 'https://randomuser.me/api/portraits/men/17.jpg',
      },
    ],
  },

  {
    email: `julian.anderson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "Political economy in one sentence:",
        answer: "Markets don't exist outside political arrangements — the question is always who decides the rules and who benefits from them.",
        photoUrl: 'https://randomuser.me/api/portraits/men/18.jpg',
      },
      {
        question: "What Georgetown adds to IR:",
        answer: "Proximity to the actual institutions. Half my professors have had real jobs in the real world. That changes what the theories look like.",
      },
      {
        question: "I've been told I explain things well:",
        answer: "I've decided to believe that. The alternative is to think people are just being polite and I don't have evidence for that.",
        photoUrl: 'https://randomuser.me/api/portraits/men/18.jpg',
      },
    ],
  },

  {
    email: `declan.walker${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What neuroinflammation research is really trying to answer:",
        answer: "Why the same injury produces wildly different outcomes in different people. The inflammation is the difference. Mostly.",
        photoUrl: 'https://randomuser.me/api/portraits/men/19.jpg',
      },
      {
        question: "What cooking does for me after a long day in the lab:",
        answer: "Gives me a problem with a clear solution and a tangible result. Labs don't always give you that.",
      },
      {
        question: "The thing that makes me unusual in pre-med:",
        answer: "I read the papers I cite. All of them. I know this is apparently rare. It shouldn't be.",
        photoUrl: 'https://randomuser.me/api/portraits/men/19.jpg',
      },
    ],
  },

  {
    email: `gabriel.young${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What systems programming is:",
        answer: "Making guarantees the rest of the stack can rely on. Everything that works invisibly is built on someone's invisible work.",
        photoUrl: 'https://randomuser.me/api/portraits/men/20.jpg',
      },
      {
        question: "The basketball read I use in engineering:",
        answer: "Pattern recognition under time pressure with incomplete information. Identical skill set, different domain.",
      },
      {
        question: "What I look for in a person:",
        answer: "Someone who can be excellent at something and still curious about everything else.",
        photoUrl: 'https://randomuser.me/api/portraits/men/20.jpg',
      },
    ],
  },

  {
    email: `santiago.lee${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What sustainable infrastructure actually means:",
        answer: "Systems that are designed with their end of life in mind before they're built. Most infrastructure isn't.",
        photoUrl: 'https://randomuser.me/api/portraits/men/21.jpg',
      },
      {
        question: "The built environment I care about most:",
        answer: "Water systems in mid-size American cities. The infrastructure crisis is real and the timeline is shorter than people think.",
      },
      {
        question: "Why Berkeley for civil engineering:",
        answer: "The Bay Area is the most interesting civil engineering problem in the country. Seismic, transit, housing. I'm studying the case study I'm living in.",
        photoUrl: 'https://randomuser.me/api/portraits/men/21.jpg',
      },
    ],
  },

  {
    email: `mateo.reyes${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What my feature script is actually about:",
        answer: "A man who can only understand his own family through the stories he tells about other people's families. It's autobiographical in ways I'm still discovering.",
        photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      },
      {
        question: "The director I argue with most:",
        answer: "Terrence Malick. I think he's the best and I think he stopped having anything to say around 2012. Controversial.",
      },
      {
        question: "What exhausting-to-date means for a filmmaker:",
        answer: "I notice narrative in real conversations. I can't turn it off. I'm told it makes me an interesting person to talk to once you stop being self-conscious about it.",
        photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      },
    ],
  },

  {
    email: `theodore.hill${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What building a startup at Michigan taught me:",
        answer: "That product-market fit is mostly just talking to enough people honestly. Most founders skip that part.",
        photoUrl: 'https://randomuser.me/api/portraits/men/24.jpg',
      },
      {
        question: "The ML problem I care about most right now:",
        answer: "Domain adaptation — making models work on data they haven't seen. This is the actual bottleneck for most applications.",
      },
      {
        question: "What 'either make it or learn something expensive' means in practice:",
        answer: "I've already learned several expensive things. The startup is still running. Both are fine.",
        photoUrl: 'https://randomuser.me/api/portraits/men/24.jpg',
      },
    ],
  },

  {
    email: `kai.robinson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "Quantum computing for non-physicists:",
        answer: "We're trying to use quantum mechanical phenomena — superposition, entanglement — to do computations that would take classical computers longer than the age of the universe.",
        photoUrl: 'https://randomuser.me/api/portraits/men/25.jpg',
      },
      {
        question: "Why I climb:",
        answer: "It requires your full attention. You cannot be anxious about physics problems when you're 40 feet up without a rope.",
      },
      {
        question: "The question I ask most in conversation:",
        answer: "What do you actually think? Not what the consensus is, not what the safe answer is — what you think.",
        photoUrl: 'https://randomuser.me/api/portraits/men/25.jpg',
      },
    ],
  },

  {
    email: `adrian.scott${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "My education equity argument:",
        answer: "The zip code you're born in should not be the primary determinant of the quality of education you receive. It currently is. That's a policy failure.",
        photoUrl: 'https://randomuser.me/api/portraits/men/26.jpg',
      },
      {
        question: "Data and values in the same conversation:",
        answer: "The data tells you what is. The values tell you what matters. You need both or you're either ignorant or directionless.",
      },
      {
        question: "What I want from someone I date:",
        answer: "Someone who cares about something larger than their own trajectory. The most attractive thing is having a stake in something.",
        photoUrl: 'https://randomuser.me/api/portraits/men/26.jpg',
      },
    ],
  },

  {
    email: `miles.green${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What UChicago economics actually is:",
        answer: "The discipline of being willing to follow an argument wherever it goes, even when the conclusion is uncomfortable. Especially then.",
        photoUrl: 'https://randomuser.me/api/portraits/men/27.jpg',
      },
      {
        question: "The argument I make at dinner that people don't expect:",
        answer: "That price controls cause the shortages they're designed to prevent. I've been doing this since I was 19. I regret nothing.",
      },
      {
        question: "What I look for in a person:",
        answer: "Someone willing to update their position when the evidence changes. Not immediately, not easily — but when it genuinely warrants it.",
        photoUrl: 'https://randomuser.me/api/portraits/men/27.jpg',
      },
    ],
  },

  {
    email: `remy.baker${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "My real estate thesis as an LA native:",
        answer: "The cities people are moving to in 2025 are the cities that solved parking in 2015. Urban density is the investment.",
        photoUrl: 'https://randomuser.me/api/portraits/men/28.jpg',
      },
      {
        question: "What being from LA actually means:",
        answer: "I understand the freeway system intuitively and I will always know the good taco spot. These are transferable skills.",
      },
      {
        question: "How I spend a weekend that actually restores me:",
        answer: "Malibu on Saturday morning, real meal cooked at home Saturday night, completely offline Sunday. Non-negotiable.",
        photoUrl: 'https://randomuser.me/api/portraits/men/28.jpg',
      },
    ],
  },

  {
    email: `xavier.adams${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What film scoring is that film scoring isn't:",
        answer: "The best scores tell you what to feel before the image does. The bad ones just describe what you're already seeing.",
        photoUrl: 'https://randomuser.me/api/portraits/men/29.jpg',
      },
      {
        question: "My complicated relationship with silence:",
        answer: "I've trained myself to hear structure in it. There are no empty spaces in music — only space that hasn't been filled yet.",
      },
      {
        question: "Why NYC is home:",
        answer: "The density of interesting people per square mile is genuinely unmatched. I've had the best conversations of my life in Brooklyn.",
        photoUrl: 'https://randomuser.me/api/portraits/men/29.jpg',
      },
    ],
  },

  {
    email: `finn.nelson${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What we owe each other in the age of AI:",
        answer: "Transparency about when you're using it and honesty about what it changes in your thinking. The tool isn't the problem. The opacity is.",
        photoUrl: 'https://randomuser.me/api/portraits/men/30.jpg',
      },
      {
        question: "The ethics question I think about most:",
        answer: "Whether consent is a sufficient basis for moral justification or whether some things are wrong regardless of consent.",
      },
      {
        question: "What I want in a conversation:",
        answer: "Someone who distinguishes between what they believe and why they believe it. The second question is usually more interesting.",
        photoUrl: 'https://randomuser.me/api/portraits/men/30.jpg',
      },
    ],
  },

  {
    email: `holden.carter${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "Why solving climate requires talking to both scientists and senators:",
        answer: "Because the scientists have the facts and the senators have the votes, and one without the other is either useless or dangerous.",
        photoUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
      },
      {
        question: "My trail running rule:",
        answer: "Go until you're not thinking about anything you were thinking about when you started. Usually about four miles.",
      },
      {
        question: "What environmental science taught me about politics:",
        answer: "That the hardest part is never the evidence. It's always the incentives.",
        photoUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
      },
    ],
  },

  {
    email: `rowan.mitchell${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What adaptive reuse means and why I care:",
        answer: "Taking buildings that served one purpose and redesigning them for another. It's the most honest architectural work — you're in conversation with what came before.",
        photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      {
        question: "What New Orleans teaches architecture students that other cities don't:",
        answer: "That buildings don't just shelter people — they hold culture. The building survives the storm. The culture rebuilds the neighborhood.",
      },
      {
        question: "What I look for in a person:",
        answer: "Someone who notices things. Architecture, music, the quality of light in a room. Attention is a form of respect.",
        photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
    ],
  },

  {
    email: `silas.roberts${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What distributed systems actually is:",
        answer: "The engineering discipline of building things that work correctly even when parts of them fail. This turns out to describe most of life.",
        photoUrl: 'https://randomuser.me/api/portraits/men/34.jpg',
      },
      {
        question: "Why I cycle instead of run:",
        answer: "I can go further before my brain turns off. That's where the interesting thinking happens.",
      },
      {
        question: "The thing about 'working at scale' most people don't realize:",
        answer: "The bottleneck is almost never compute. It's usually the assumption that worked at 10x that breaks at 100x.",
        photoUrl: 'https://randomuser.me/api/portraits/men/34.jpg',
      },
    ],
  },

  {
    email: `beckett.turner${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What pre-med at Penn State actually looks like:",
        answer: "Research, MCAT, clinical hours, and enough coursework to wonder if sleep is optional. It is not optional.",
        photoUrl: 'https://randomuser.me/api/portraits/men/35.jpg',
      },
      {
        question: "What cooking under pressure produces:",
        answer: "Increasingly good technique. Stress and repetition are, it turns out, decent teachers.",
      },
      {
        question: "The type of medicine I want to practice:",
        answer: "Emergency. The diagnostic window is short, the stakes are real, and the decisions matter immediately.",
        photoUrl: 'https://randomuser.me/api/portraits/men/35.jpg',
      },
    ],
  },

  {
    email: `tobias.phillips${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What I actually do with large datasets:",
        answer: "Find the signal that was there all along and build the case for why it matters. Mostly it's convincing people the signal is real.",
        photoUrl: 'https://randomuser.me/api/portraits/men/36.jpg',
      },
      {
        question: "How I do the same thing with people:",
        answer: "I notice patterns in how people talk about their choices. The patterns are usually more revealing than the choices.",
      },
      {
        question: "What I want in a relationship:",
        answer: "Someone who can be observed without feeling analyzed. I'm better at listening than I sometimes appear.",
        photoUrl: 'https://randomuser.me/api/portraits/men/36.jpg',
      },
    ],
  },

  {
    email: `roman.campbell${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "My investment philosophy as a finance undergrad:",
        answer: "Markets are right about most things most of the time and wrong about specific things in predictable ways. The edge is in the specifics.",
        photoUrl: 'https://randomuser.me/api/portraits/men/37.jpg',
      },
      {
        question: "What crypto taught me that finance class didn't:",
        answer: "That narrative can precede and create the fundamentals it appears to be tracking. This is either a profound insight or a liability.",
      },
      {
        question: "How I decompress from a hard week:",
        answer: "Basketball. Something about moving in a physical space with other people resets whatever got tangled up mentally.",
        photoUrl: 'https://randomuser.me/api/portraits/men/37.jpg',
      },
    ],
  },

  {
    email: `dante.evans${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What robotics co-op taught me that classes didn't:",
        answer: "The gap between 'it works in simulation' and 'it works in the real world' is where most engineers live.",
        photoUrl: 'https://randomuser.me/api/portraits/men/38.jpg',
      },
      {
        question: "The autonomous systems problem I care about most:",
        answer: "Navigation in unstructured environments. Getting a robot to handle novelty is the hard part. Warehouses are solved. Everything else isn't.",
      },
      {
        question: "What I want from someone I date:",
        answer: "Someone building something they're genuinely excited about. The field doesn't matter. The energy does.",
        photoUrl: 'https://randomuser.me/api/portraits/men/38.jpg',
      },
    ],
  },

  {
    email: `pascal.edwards${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What two think-tank internships taught me:",
        answer: "That the gap between the best policy thinking and the best policy that can pass is enormous and underappreciated.",
        photoUrl: 'https://randomuser.me/api/portraits/men/39.jpg',
      },
      {
        question: "The IR question I keep coming back to:",
        answer: "Whether international institutions constrain state behavior or just provide language for justifying it after the fact.",
      },
      {
        question: "What I want in a conversation:",
        answer: "Someone who has thought carefully about something outside their direct expertise. Genuine cross-domain curiosity.",
        photoUrl: 'https://randomuser.me/api/portraits/men/39.jpg',
      },
    ],
  },

  {
    email: `dorian.collins${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What energy systems engineering actually is:",
        answer: "Designing the infrastructure that will determine whether the energy transition happens in time. The hardware, not the policy.",
        photoUrl: 'https://randomuser.me/api/portraits/men/40.jpg',
      },
      {
        question: "Why I rock climb:",
        answer: "The problem is physical and the solution is technical and you can't think about anything else. That's rare.",
      },
      {
        question: "What knowing since age eight you want to work on spacecraft does to you:",
        answer: "Gives you a very long time horizon and a low tolerance for work that doesn't matter. Both are useful.",
        photoUrl: 'https://randomuser.me/api/portraits/men/40.jpg',
      },
    ],
  },

  {
    email: `sterling.stewart${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What quantitative finance taught me about irrationality:",
        answer: "Markets are irrational on the micro level in ways that are remarkably consistent. Consistency is exploitable.",
        photoUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
      },
      {
        question: "My tennis game as a metaphor for how I work:",
        answer: "Consistent baseline, patient, opportunistic when the window opens. I don't force it.",
      },
      {
        question: "What I look for in a person:",
        answer: "Someone who has standards and can articulate why. Taste without reasoning is just preference.",
        photoUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
      },
    ],
  },

  {
    email: `archer.murphy${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What brand strategy really is:",
        answer: "Getting a company to choose what it will not do. The no's are more revealing than the yes's.",
        photoUrl: 'https://randomuser.me/api/portraits/men/43.jpg',
      },
      {
        question: "The campaign I think about most:",
        answer: "Apple's Think Different. Not because of the product — because of who they were talking to and who they were asking to become.",
      },
      {
        question: "What I look for in a city:",
        answer: "Enough density to feel alive, enough green to decompress, and at least three places I'd be embarrassed not to know.",
        photoUrl: 'https://randomuser.me/api/portraits/men/43.jpg',
      },
    ],
  },

  {
    email: `cedric.howard${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "The most extraordinary thing I've seen diving:",
        answer: "A manta ray cleaning station in the Maldives. Twenty rays in ten minutes. I didn't move for forty minutes.",
        photoUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
      },
      {
        question: "What marine biology is that other biology isn't:",
        answer: "The lab is 70% of the planet's surface and you still have to get there. Logistics are half the science.",
      },
      {
        question: "My trivia category of unsolicited expertise:",
        answer: "Ocean circulation patterns. I will explain the thermohaline conveyor belt at any opportunity and I have learned to identify who wants this.",
        photoUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
      },
    ],
  },

  {
    email: `jasper.ward${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What Hopkins pre-med actually is:",
        answer: "Being surrounded by people who are also excellent and learning that excellence is necessary but not sufficient.",
        photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
      },
      {
        question: "What music keeps human during exam season:",
        answer: "Late Coltrane for studying, Springsteen for running, anything live when I need to remember that music is supposed to happen in rooms.",
      },
      {
        question: "The thing I'm most proud of:",
        answer: "Maintaining genuine curiosity about medicine after three years of having it treated as a credential.",
        photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
      },
    ],
  },

  {
    email: `felix.reed${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What thinking about the nature of time actually does to you:",
        answer: "Makes you significantly less stressed about deadlines. The arrow of time is a thermodynamic phenomenon. The deadline is a social construction.",
        photoUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
      },
      {
        question: "The Caltech experience in one honest sentence:",
        answer: "The smartest people I've ever been around, in a place that is completely indifferent to almost everything outside of physics.",
      },
      {
        question: "What I want someone to find interesting, not intimidating:",
        answer: "The strangeness. Reality is deeply, provably strange. That's not threatening — it's the best thing about being alive.",
        photoUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
      },
    ],
  },

  {
    email: `orion.fleming${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What knowing since age eight looks like at 22:",
        answer: "A focused undergraduate career, two summers at JPL, and a graduate school list that's entirely aerospace. No regrets.",
        photoUrl: 'https://randomuser.me/api/portraits/men/47.jpg',
      },
      {
        question: "The spacecraft problem I care about most:",
        answer: "Orbital debris management. We are currently filling low Earth orbit with junk in ways that could make it unusable within 50 years.",
      },
      {
        question: "What I want in someone I date:",
        answer: "Someone with a long time horizon. Not just career-wise — philosophically. Someone who thinks about the next 50 years, not just the next 5.",
        photoUrl: 'https://randomuser.me/api/portraits/men/47.jpg',
      },
    ],
  },

  {
    email: `callum.gray${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What computer vision actually is:",
        answer: "Teaching a machine to see by defining what seeing means mathematically. This turns out to be much harder than we thought and the results are still weird.",
        photoUrl: 'https://randomuser.me/api/portraits/men/48.jpg',
      },
      {
        question: "The startup stage I'm in:",
        answer: "Post-idea, pre-revenue. Building something I believe matters, in a space that isn't crowded yet.",
      },
      {
        question: "What 'it's going to work or teach me something' means:",
        answer: "I've given myself permission to fail intelligently. I keep better notes now than I did before.",
        photoUrl: 'https://randomuser.me/api/portraits/men/48.jpg',
      },
    ],
  },

  {
    email: `nico.cooper${BOT_EMAIL_DOMAIN}`,
    prompts: [
      {
        question: "What art history at Yale actually prepared me for:",
        answer: "Reading context. Every object carries the conditions of its making. This is as true of people as it is of paintings.",
        photoUrl: 'https://randomuser.me/api/portraits/men/49.jpg',
      },
      {
        question: "The Baroque painting I could talk about for two hours:",
        answer: "Caravaggio's The Calling of Saint Matthew. The light, the gesture, the specificity of who looks and who doesn't.",
      },
      {
        question: "What I'm looking for:",
        answer: "Someone who will let me talk about painting for twenty minutes and then change the subject to something I haven't thought about yet.",
        photoUrl: 'https://randomuser.me/api/portraits/men/49.jpg',
      },
    ],
  },
];

async function main() {
  console.log('Seeding prompts for 90 extra-bot profiles...\n');
  let updated = 0;
  let notFound = 0;

  for (const bot of botPrompts) {
    const result = await db
      .update(users)
      .set({ prompts: bot.prompts as unknown as typeof users.$inferInsert['prompts'] })
      .where(eq(users.email, bot.email))
      .returning({ id: users.id, email: users.email });

    if (result.length > 0) {
      console.log(`  + ${bot.email}`);
      updated++;
    } else {
      console.warn(`  ! Not found: ${bot.email}`);
      notFound++;
    }
  }

  console.log(`\nDone. Updated ${updated} bots with prompts.`);
  if (notFound > 0) {
    console.warn(`   ${notFound} bots not found — run npm run db:extra-bots first.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
