export interface FileReadResult {
  content: string;
  filename: string;
  fileSize: number;
  fileType: 'txt' | 'csv';
  lineCount: number;
}

export function readFileAsync(file: File, maxSizeBytes: number = 20 * 1024 * 1024): Promise<FileReadResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'));
      return;
    }

    if (file.size > maxSizeBytes) {
      reject(new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of 20 MB.`));
      return;
    }

    const name = file.name.toLowerCase();
    let fileType: 'txt' | 'csv' | null = null;

    if (name.endsWith('.txt') || file.type === 'text/plain') {
      fileType = 'txt';
    } else if (name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
      fileType = 'csv';
    } else {
      reject(new Error(`Unsupported file type: "${file.name}". ZERO TRACE supports .txt and .csv documents.`));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const lineCount = content.split('\n').length;
      resolve({
        content,
        filename: file.name,
        fileSize: file.size,
        fileType,
        lineCount,
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file contents from browser storage.'));
    };

    reader.readAsText(file);
  });
}
