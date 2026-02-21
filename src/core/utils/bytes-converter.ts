export type Byte = number;
export type Kilobyte = number;
export type Megabyte = number;
export type Gigabyte = number;
export type Terabyte = number;

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;

export const kbToBytes = (kb: Kilobyte): Byte => kb * KB;
export const mbToBytes = (mb: Megabyte): Byte => mb * MB;
export const gbToBytes = (gb: Gigabyte): Byte => gb * GB;
export const tbToBytes = (tb: Terabyte): Byte => tb * TB;

export const bytesToKb = (bytes: Byte): Kilobyte => bytes / KB;
export const bytesToMb = (bytes: Byte): Megabyte => bytes / MB;
export const bytesToGb = (bytes: Byte): Gigabyte => bytes / GB;
export const bytesToTb = (bytes: Byte): Terabyte => bytes / TB;

export const kbToMb = (kb: Kilobyte): Megabyte => kb / KB;
export const kbToGb = (kb: Kilobyte): Gigabyte => kb / MB;

export const mbToKb = (mb: Megabyte): Kilobyte => mb * KB;
export const mbToGb = (mb: Megabyte): Gigabyte => mb / KB;

export const gbToMb = (gb: Gigabyte): Megabyte => gb * KB;
export const gbToKb = (gb: Gigabyte): Kilobyte => gb * MB;

export const tbToGb = (tb: Terabyte): Gigabyte => tb * KB;
export const tbToMb = (tb: Terabyte): Megabyte => tb * MB;
