const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;

/** Max file size in bytes (5MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

function isHeicFile(file: File): boolean {
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  // Some browsers don't set a MIME type for HEIC at all — fall back to
  // the file extension so iPhone uploads still get caught.
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

/**
 * Reads a File, decodes it (with EXIF rotation applied), resizes to a max
 * dimension, re-encodes, and returns an object URL. Designed for easy swap
 * to Vercel Blob later — replace the return with the blob URL from the
 * upload response.
 *
 * Format handling:
 *   - HEIC/HEIF → converted to JPEG via heic2any (lazy-loaded so non-iPhone
 *     uploads don't pay the bundle cost).
 *   - PNG → re-encoded as PNG so transparency (e.g. monogram with alpha)
 *     survives.
 *   - Everything else → JPEG at quality 0.85.
 *
 * EXIF rotation is applied via `createImageBitmap(blob, { imageOrientation:
 * "from-image" })` — fixes sideways portrait photos from phones.
 */
export async function processImage(file: File): Promise<string> {
  let blob: Blob = file;
  let outputType: "image/jpeg" | "image/png" =
    file.type === "image/png" ? "image/png" : "image/jpeg";

  // HEIC: convert to JPEG before decoding. Lazy-load the library so we
  // only pay the ~80KB cost for HEIC uploads.
  if (isHeicFile(file)) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    blob = Array.isArray(converted) ? converted[0] : converted;
    outputType = "image/jpeg";
  }

  // Decode with EXIF orientation applied (browser fallback to no rotation
  // if not supported — graceful degradation to today's behavior).
  const bitmap = await createImageBitmap(blob, {
    imageOrientation: "from-image",
  });

  // Compute scaled dimensions while preserving aspect ratio.
  let { width, height } = bitmap;
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }
  if (height > MAX_HEIGHT) {
    width = Math.round((width * MAX_HEIGHT) / height);
    height = MAX_HEIGHT;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas context not available");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (out) => {
        if (!out) {
          reject(new Error("Failed to encode image"));
          return;
        }
        resolve(URL.createObjectURL(out));
      },
      outputType,
      outputType === "image/jpeg" ? 0.85 : undefined,
    );
  });
}

export function validateFile(file: File): string | null {
  const isImage = file.type.startsWith("image/") || isHeicFile(file);
  if (!isImage) {
    return "Please upload an image file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be under 5MB.";
  }
  return null;
}
