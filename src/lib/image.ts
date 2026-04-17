const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;

/**
 * Reads a File, resizes it to a max dimension, and returns an object URL.
 * Designed for easy swap to Vercel Blob later — just replace the return
 * with the blob URL from the upload response.
 */
export async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        // Calculate scaled dimensions
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        // Resize via canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob → object URL
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Max file size in bytes (5MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please upload an image file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be under 5MB.";
  }
  return null;
}
