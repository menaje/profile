import { access, copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptRoot, "..");
const outputRoot = path.join(projectRoot, "output");
const downloadsRoot = path.join(projectRoot, "public", "downloads");

const pdfTargets = [
  {
    label: "이력서",
    sourceName: "01_김성식_이력서.pdf",
    outputName: "resume-ko.pdf",
  },
  {
    label: "기술경력서",
    sourceName: "02_김성식_기술경력서.pdf",
    outputName: "technical-career-ko.pdf",
  },
  {
    label: "자기소개서",
    sourceName: "03_김성식_자기소개서.pdf",
    outputName: "personal-statement-ko.pdf",
  },
];

await mkdir(downloadsRoot, { recursive: true });

let syncedCount = 0;
let missingCount = 0;

for (const pdf of pdfTargets) {
  const sourcePath = path.join(outputRoot, pdf.sourceName).normalize("NFC");
  const destinationPath = path.join(downloadsRoot, pdf.outputName);

  // Also try NFD variant (macOS decomposes Unicode filenames)
  const sourcePathNFD = path.join(outputRoot, pdf.sourceName).normalize("NFD");

  if (await fileExists(sourcePath) || await fileExists(sourcePathNFD)) {
    const actualPath = (await fileExists(sourcePath)) ? sourcePath : sourcePathNFD;
    await copyFile(actualPath, destinationPath);
    syncedCount += 1;
    console.log(`[sync-pdfs] synced ${pdf.label}: ${pdf.outputName}`);
    continue;
  }

  missingCount += 1;
  await rm(destinationPath, { force: true });
  console.warn(
    `[sync-pdfs] warning: missing source for ${pdf.label} (${sourcePath}). Hiding its download link.`,
  );
}

console.log(
  `[sync-pdfs] complete: ${syncedCount} synced, ${missingCount} missing.`,
);

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
