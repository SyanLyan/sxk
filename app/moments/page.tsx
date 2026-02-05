import fs from "fs";
import path from "path";
import exifr from "exifr";
import { withBasePath } from "@/lib/utils";
import MomentsClient, { MomentItem, CollectionItem } from "./moments-client";

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);

const collectionsConfig = [
  {
    id: "her-birthday",
    folder: "her-birthday",
    title: "Her Birthday",
    description: "Celebrating her special day, together.",
    cover: ""
  },
  {
    id: "my-birthday",
    folder: "my-birthday",
    title: "My Birthday",
    description: "Another year around the sun, with you by my side.",
    cover: ""
  },
  {
    id: "our-trip",
    folder: "our-trip",
    title: "Our Trip Together",
    description: "New places, shared memories, endless adventures.",
    cover: ""
  },
];

function toTitleFromFilename(filename: string): string {
  const base = filename.replace(path.extname(filename), "");
  const cleaned = base.replace(/[_-]+/g, " ").trim();
  return cleaned.length > 0
    ? cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
    : "Captured Moment";
}

function getMediaFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

function getCollectionImages(folderName: string): string[] {
  const publicDir = path.join(process.cwd(), "public");
  const imgPath = path.join(publicDir, "Together", "img", folderName);
  const videoPath = path.join(publicDir, "Together", "video", folderName);

  const media: string[] = [];
  
  // Check for Images
  if (fs.existsSync(imgPath)) {
    fs.readdirSync(imgPath)
      .filter(file => imageExtensions.has(path.extname(file).toLowerCase()))
      .forEach(file => media.push(withBasePath(`/Together/img/${folderName}/${file}`)));
  }

  // Check for Videos
  if (fs.existsSync(videoPath)) {
    fs.readdirSync(videoPath)
      .filter(file => videoExtensions.has(path.extname(file).toLowerCase()))
      .forEach(file => media.push(withBasePath(`/Together/video/${folderName}/${file}`)));
  }

  return media;
}

async function getImageDate(fullPath: string, stats: fs.Stats): Promise<Date> {
  try {
    const exif = await exifr.parse(fullPath, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
    });
    const exifDate =
      (exif?.DateTimeOriginal as Date | undefined) ||
      (exif?.CreateDate as Date | undefined) ||
      (exif?.ModifyDate as Date | undefined);

    if (exifDate instanceof Date && !Number.isNaN(exifDate.getTime())) {
      return exifDate;
    }
  } catch {
    // Ignore EXIF read errors and fall back to file timestamps
  }

  return stats.birthtime || stats.mtime;
}

async function buildDynamicMoments(): Promise<MomentItem[]> {
  const publicDir = path.join(process.cwd(), "public");
  const imageDir = path.join(publicDir, "Together", "img");
  const videoDir = path.join(publicDir, "Together", "video");

  // Get standalone files directly in `Together/img` (not in subfolders)
  const images = getMediaFiles(imageDir).filter((file) => {
      const isImage = imageExtensions.has(path.extname(file).toLowerCase());
      const isFile = fs.statSync(path.join(imageDir, file)).isFile(); 
      return isImage && isFile;
  });

  const videos = getMediaFiles(videoDir).filter((file) =>
    videoExtensions.has(path.extname(file).toLowerCase()),
  );

  const items: Array<Omit<MomentItem, "id"> & { sortTime: number }> = [];

  const imageItems = await Promise.all(
    images.map(async (file) => {
      const fullPath = path.join(imageDir, file);
      const stats = fs.statSync(fullPath);
      const date = await getImageDate(fullPath, stats);
      const time = date.getTime();

      return {
        title: toTitleFromFilename(file),
        date: "",
        location: "Memory Lane",
        type: "image" as const,
        src: withBasePath(`/Together/img/${file}`),
        description: "A frozen fragment of time, kept safe forever.",
        tags: ["Memory", "Photo"],
        sortTime: time,
      };
    }),
  );

  items.push(...imageItems);

  for (const file of videos) {
    const fullPath = path.join(videoDir, file);
    const stats = fs.statSync(fullPath);
    const time = (stats.birthtime || stats.mtime).getTime();

    items.push({
      title: toTitleFromFilename(file),
      date: "",
      location: "Memory Lane",
      type: "video",
      src: withBasePath(`/Together/video/${file}`),
      description: "A moving memory, preserved forever.",
      tags: ["Memory", "Video"],
      sortTime: time,
    });
  }

  items.sort((a, b) => a.sortTime - b.sortTime);

  return items.map((item, index) => {
    const { sortTime, ...rest } = item;
    return { id: index + 1, ...rest };
  });
}

function buildCollections(): CollectionItem[] {
  return collectionsConfig.map(config => {
      const images = getCollectionImages(config.folder);
      return {
          id: config.id,
          title: config.title,
          description: config.description,
          cover: images.length > 0 ? images[0] : "", // Default to first image
          images: images
      };
  });
}

export default async function Moments() {
  const moments = await buildDynamicMoments();
  const collections = buildCollections();
  
  return <MomentsClient moments={moments} collections={collections} />;
}
