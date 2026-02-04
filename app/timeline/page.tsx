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
    image: withBasePath("/assets/timeline/img/1000005351.jpeg")
  },
  {
    year: "2025",
    title: "Adventures in Thanlyin",
    date: "March 15",
    location: "Thanlyin Bridge",
    description: "Wind in our hair, sun on our faces. We explored the old town, finding beauty in the ruins and in each other's company.",
    tags: ["Travel", "Memory"],
    image: withBasePath("/timeline/img/1000005438.jpeg")
  },
  {
    year: "2025",
    title: "Quiet Moments",
    date: "August 20",
    location: "Home",
    description: "Realizing that the best adventures are often the quiet ones—shared silence, coffee, and understanding without words.",
    tags: ["Intimacy", "Growth"],
    image: withBasePath("/timeline/img/1000011919.jpeg")
  },
  {
    year: "2026",
    title: "Building Forever",
    date: "Today",
    location: "The Future",
    description: "Every day adds a new brick to the castle we are building together. The best is yet to come.",
    tags: ["Future", "Dreams"],
    image: withBasePath("/timeline/img/1000011608.jpeg")
  },
];

export default function TimelinePage() {
  return <TimelineClient events={mockEvents} />;
}
