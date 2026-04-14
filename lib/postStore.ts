import { promises as fs } from "fs";
import path from "path";

export type StoredPost = {
  id: string;
  createdAt: string;
  companyId: string;
  ideaTitle: string;
  masterHook: string;
  rawInput: string;
  status: "draft" | "ready" | "published";
  platforms: Record<
    string,
    {
      title: string;
      caption: string;
      hashtags: string[];
      cta: string;
    }
  >;
  image?: {
    base64: string;
    mimeType: string;
  };
  video?: {
    videoUrl?: string;
    videoPath?: string;
    caption?: string;
    hook?: string;
    main?: string;
    cta?: string;
    hashtags?: string[];
  };
};

const STORE_PATH = path.join(process.cwd(), "data-store", "posts.json");

async function ensureStore() {
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, "[]", "utf-8");
  }
}

export async function readPosts(): Promise<StoredPost[]> {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function writePosts(posts: StoredPost[]) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(posts, null, 2), "utf-8");
}

export function createPostId(prefix = "post") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
