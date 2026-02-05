import TimelineClient, { TimelineEvent } from './timeline-client';
import { withBasePath } from "@/lib/utils";

const mockEvents: TimelineEvent[] = [
  {
    year: "2024",
    title: "The First Spark",
    date: "December 27",
    location: "New Beginnings",
    description: "The moment our universes collided. It wasn't just a meeting; it was the start of a story written in the stars. The world seemed to pause, if only for a second.",
    tags: ["First Meet", "Destiny"],
    image: withBasePath("/Timeline/img/1000005351.jpeg")
  },
  {
    year: "2025",
    title: "Office Selfie",
    date: "June 12",
    location: "The Office",
    description: "A candid moment captured at work. Even in the office, we find reasons to smile together.",
    tags: ["Work", "Together"],
    image: withBasePath("/Timeline/img/1000005438.jpeg")
  },
  {
    year: "2026",
    title: "Casual Shopping Date",
    date: "January 18",
    location: "SPIRITS",
    description: "A fun day out shopping and walking around together. Just enjoying a casual date and each other's company.",
    tags: ["Date", "Shopping"],
    image: withBasePath("/Timeline/img/1000011919.jpeg")
  },
  {
    year: "2026",
    title: "Building Forever",
    date: "Today",
    location: "The Future",
    description: "Every day adds a new brick to the castle we are building together. The best is yet to come.",
    tags: ["Future", "Dreams"],
    image: withBasePath("/Timeline/img/1000011608.jpeg")
  },
];

export default function TimelinePage() {
  return <TimelineClient events={mockEvents} />;
}
