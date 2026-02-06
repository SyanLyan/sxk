import fs from 'fs';
import path from 'path';
import { withBasePath } from "@/lib/utils";
import GalleryClient, { type Collection } from './gallery-client';

// Define the metadata for your collections.
const collectionsConfig = [
  {
    id: "beach",
    folder: "beach",
    title: "Sunset & Beach",
    description: "Golden hours and ocean breeze",
  },
  {
    id: "thanlyin-kimono",
    folder: "thanlyin",
    title: "Thanlyin Trip & Kimono",
    description: "Strolling through Thanlyin, she wore a delicate Japanese kimono, blending tradition with our shared adventure.",
  },
  {
    id: "casual-photoshoot",
    folder: "casual",
    title: "Casual Photoshoot",
    description: "A relaxed day capturing her natural charm and effortless elegance, just us and the camera.",
  },
  {
    id: "her-unscripted",
    folder: "unscripted",
    type: "video",
    title: "Her, Unscripted",
    description: "Raw, candid moments in motion.",
  },
  {
    id: "secret",
    folder: "secret",
    title: "Secret Archive",
    description: "Only for us.",
  },
  {
    id: "date-bites",
    folder: "date-bites",
    title: "Date-Bites",
    description: "Food, laughs, and us."
  }
];

function getMediaForCollection(folderName: string, isVideo = false): string[] {
    const publicDir = path.join(process.cwd(), 'public');
    // Switch base path between 'img' and 'video' based on type
    const assetType = isVideo ? 'video' : 'img';
    const relativePath = path.join('Her', assetType, folderName);
    const fullPath = path.join(publicDir, relativePath);

    if (!fs.existsSync(fullPath)) {
        return [];
    }

    try {
        const files = fs.readdirSync(fullPath);
        
        const imageRegex = /\.(jpeg|jpg|png|webp|gif)$/i;
        const videoRegex = /\.(mp4|webm|mov)$/i;
        const regex = isVideo ? videoRegex : imageRegex;

        return files
            .filter(file => regex.test(file))
            .map(file => {
                 return withBasePath(`/${relativePath.replace(/\\/g, '/')}/${file}`);
            });
    } catch (error) {
        console.error(`Error reading directory ${fullPath}:`, error);
        return [];
    }
}

export default function GalleryPage() {
    const collections: Collection[] = collectionsConfig.map(config => {
        const isVideo = (config as any).type === 'video';
        const media = getMediaForCollection(config.folder, isVideo);
        
        return {
            id: config.id,
            title: config.title,
            description: config.description,
            cover: media.length > 0 ? media[0] : '', 
            images: media
        };
    });

    return <GalleryClient initialCollections={collections} />;
}
