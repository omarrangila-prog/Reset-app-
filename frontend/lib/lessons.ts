/**
 * Learn content — short, plain-language lessons. Real, supportive, evidence-
 * informed writing (no lorem, no clinical jargon). Kept in one place so the
 * library list and the reader share the same source.
 */

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  category: "Understand" | "In the moment" | "Build habits";
  body: string[]; // paragraphs
}

export const LESSONS: Lesson[] = [
  {
    slug: "why-urges-happen",
    title: "Why urges happen",
    summary: "Urges aren't a sign you're broken. Here's what's really going on.",
    minutes: 3,
    category: "Understand",
    body: [
      "An urge is your brain looking for a quick escape — from stress, boredom, loneliness, or just being tired. It's not proof that something is wrong with you.",
      "The important part: an urge is a wave, not a command. It rises, peaks, and fades — usually within 15–20 minutes if you don't act on it.",
      "You don't have to fight the urge or win an argument with it. You just have to let it pass. Every time you do, it gets a little easier.",
    ],
  },
  {
    slug: "ride-the-wave",
    title: "How to ride out an urge",
    summary: "A simple thing to do when the feeling hits hard.",
    minutes: 2,
    category: "In the moment",
    body: [
      "When an urge shows up, change something physical. Stand up. Walk to another room. Drink a full glass of cold water. This breaks the momentum.",
      "Then breathe slowly — in for 4, hold for 4, out for 6 — for about a minute. This tells your body it's safe to calm down.",
      "Set a short timer, even 5 minutes, and tell yourself: 'I'll decide after this.' Almost always, the wave has passed by the time it rings.",
    ],
  },
  {
    slug: "spot-your-triggers",
    title: "Spot what sets you off",
    summary: "Most urges are predictable once you know your patterns.",
    minutes: 3,
    category: "Understand",
    body: [
      "Urges usually have triggers — a certain time of day, a feeling, being alone with your phone, or a rough night's sleep.",
      "You don't need to analyze yourself. Just notice: 'What was happening right before?' Over a week or two, patterns appear on their own.",
      "Once you can see a trigger coming, you can plan for it — a walk after dinner, charging your phone in another room, an earlier bedtime.",
    ],
  },
  {
    slug: "one-percent",
    title: "Small steps beat big promises",
    summary: "Why tiny daily habits work when willpower runs out.",
    minutes: 2,
    category: "Build habits",
    body: [
      "Big promises ('I'll never do this again') feel powerful but fall apart on a hard day. Tiny habits survive hard days.",
      "Pick something small and specific: a 10-minute walk, one page of a book, lights out by 11. Small enough that you can do it tired.",
      "You're not trying to be perfect. You're trying to show up. Showing up, most days, is what actually changes things.",
    ],
  },
  {
    slug: "after-a-slip",
    title: "What to do after a slip",
    summary: "A slip isn't the end. It's part of the road.",
    minutes: 2,
    category: "Build habits",
    body: [
      "Almost everyone who gets better slips along the way. It doesn't erase your progress, and it doesn't mean you failed.",
      "Skip the shame spiral — it only makes another slip more likely. Instead, get curious: what did you need in that moment?",
      "Then take one small, kind next step. Drink some water, go for a walk, open the app. Coming back is the whole skill.",
    ],
  },
  {
    slug: "sleep-and-urges",
    title: "Why sleep matters more than you think",
    summary: "Tired brains crave quick escapes. Rest is a real tool.",
    minutes: 2,
    category: "Understand",
    body: [
      "When you're short on sleep, your brain has less patience and reaches harder for anything that feels good fast. Urges get stronger.",
      "Getting to bed a little earlier isn't about discipline — it's about making tomorrow's urges quieter and easier to handle.",
      "If late nights are your hardest time, that's not a weakness. It's just useful information you can plan around.",
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}
