import os from 'os';
import path from 'path';
import fs from 'fs';

// Store all active processing, uploads, and temporary artifacts in the system tmpdir.
// This prevents inotify/file-system watchers on the project workspace from triggering
// spurious server restarts when images are uploaded, processed, or exported.
export const TEMP_BASE_DIR = path.resolve(os.tmpdir(), 'lumina-temp');
export const UPLOADS_DIR = path.resolve(TEMP_BASE_DIR, 'uploads');
export const CONTACT_UPLOADS_DIR = path.resolve(TEMP_BASE_DIR, 'contact-uploads');
export const CONTACT_TICKETS_FILE = path.resolve(TEMP_BASE_DIR, 'contact-tickets.json');

export function ensureTempDirectories(): void {
  try {
    if (!fs.existsSync(TEMP_BASE_DIR)) {
      fs.mkdirSync(TEMP_BASE_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONTACT_UPLOADS_DIR)) {
      fs.mkdirSync(CONTACT_UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[TempPaths] Warning ensuring temp directories:', err);
  }
}

// Automatically ensure directories exist on module load
ensureTempDirectories();
