// Supabase Storage for photo uploads
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const BUCKET_NAME = "listing-photos";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload (should be ≤500KB, compressed on client side)
 * @param path - Storage path (e.g., "listings/{listingId}/{filename}")
 */
export async function uploadPhoto(file: File, path: string): Promise<UploadResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[Storage] Supabase not configured, skipping upload");
    return { success: false, error: "存储服务未配置" };
  }

  // Validate file size (max 500KB)
  if (file.size > 500 * 1024) {
    return { success: false, error: "文件大小不能超过500KB" };
  }

  // Validate file type
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { success: false, error: "仅支持 JPG、PNG、WebP 格式" };
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: file,
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[Storage] Upload failed:", err);
      return { success: false, error: "上传失败" };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("[Storage] Upload error:", error);
    return { success: false, error: "上传失败，请重试" };
  }
}

/**
 * Compress image to target max size (500KB)
 */
export async function compressImage(file: File, maxSizeKB = 500): Promise<File> {
  if (file.size <= maxSizeKB * 1024) return file;

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      // Scale down if needed
      const maxDim = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      // Try quality levels until under maxSize
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            if (blob.size > maxSizeKB * 1024 && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            }
          },
          "image/jpeg",
          quality
        );
      };
      tryCompress();
    };
    img.src = URL.createObjectURL(file);
  });
}
