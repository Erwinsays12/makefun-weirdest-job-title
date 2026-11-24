// Weirdest Job Title: Blind Judge Showdown
//
// Writes a single job title (at most 60 characters, nothing else) to
// /output/entry.txt. The title is picked deterministically from a shortlist
// of original candidates, scored against the judge's published criteria, in
// the judge's own priority order:
//
//   1. weirdness of the job title
//   2. stranger than ordinary work (a job nobody has heard of, or one with
//      a gloriously odd twist)
//   3. funny, with a twist that lands on the first read
//   4. sounds like a real job, specific enough to picture the person doing it
//   5. reads instantly, short enough to take in at a glance
//
// No network, no clock, no environment input: the same run always writes
// the same file, so the two grading runs agree byte for byte.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

interface Candidate {
  title: string;
  // Scores out of 10, in the judge's priority order.
  weird: number;
  stranger: number;
  funny: number;
  real: number;
  instant: number;
}

// Original candidates, each a real-sounding job title with one odd twist.
// The winner is the one whose twist is the most specific and pictureable:
// relocating penguins is a job you can instantly see someone doing, in a
// hi-vis vest, with a clipboard, taking it completely seriously.
const CANDIDATES: Candidate[] = [
  {
    title: "Senior Penguin Relocation Coordinator",
    weird: 9,
    stranger: 9,
    funny: 9,
    real: 9,
    instant: 9,
  },
  {
    title: "Professional Mourner for Rich Strangers",
    weird: 8,
    stranger: 8,
    funny: 8,
    real: 9,
    instant: 8,
  },
  {
    title: "Chief Napkin Folding Inspector",
    weird: 7,
    stranger: 7,
    funny: 7,
    real: 7,
    instant: 9,
  },
  {
    title: "Senior Left Sock Pairing Analyst",
    weird: 8,
    stranger: 8,
    funny: 7,
    real: 6,
    instant: 8,
  },
  {
    title: "Professional Pillow Fluffer for Royalty",
    weird: 7,
    stranger: 7,
    funny: 8,
    real: 6,
    instant: 8,
  },
  {
    title: "Chief Iceberg Relocation Specialist",
    weird: 8,
    stranger: 8,
    funny: 7,
    real: 7,
    instant: 8,
  },
  {
    title: "Underwater Basket Weaving Instructor",
    weird: 8,
    stranger: 7,
    funny: 7,
    real: 5,
    instant: 8,
  },
  {
    title: "Professional Duck Herding Consultant",
    weird: 7,
    stranger: 7,
    funny: 7,
    real: 7,
    instant: 8,
  },
];

// Weights follow the judge's stated priority: weirdness first, then
// strangeness, then humour, then realism, then instant readability.
const WEIGHTS = { weird: 5, stranger: 4, funny: 3, real: 2, instant: 1 };

function score(candidate: Candidate): number {
  return (
    candidate.weird * WEIGHTS.weird +
    candidate.stranger * WEIGHTS.stranger +
    candidate.funny * WEIGHTS.funny +
    candidate.real * WEIGHTS.real +
    candidate.instant * WEIGHTS.instant
  );
}

function pickBest(candidates: Candidate[]): Candidate {
  // The gate caps the file at 60 characters, so a candidate longer than
  // that can never win: drop it here rather than failing at write time.
  const eligible = candidates.filter((c) => c.title.length <= 60);
  if (eligible.length === 0) {
    throw new Error("no candidate fits the 60-character gate");
  }
  // Deterministic: highest score wins; ties break to the shorter title,
  // then to the alphabetically first, so the choice never depends on order.
  return [...eligible].sort((a, b) => {
    const byScore = score(b) - score(a);
    if (byScore !== 0) return byScore;
    const byLength = a.title.length - b.title.length;
    if (byLength !== 0) return byLength;
    return a.title.localeCompare(b.title);
  })[0];
}

function main(): void {
  const best = pickBest(CANDIDATES);
  const title = best.title;

  // The gate: UTF-8 text of 1 to 60 characters, not only white space.
  if (title.length < 1 || title.length > 60) {
    throw new Error(`title must be 1-60 characters, got ${title.length}`);
  }
  if (title.trim().length === 0) {
    throw new Error("title must not be only white space");
  }

  const outDir = process.env.OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, title, "utf8");
  console.log(`wrote ${title.length} chars to ${outPath}: ${title}`);
}

main();
