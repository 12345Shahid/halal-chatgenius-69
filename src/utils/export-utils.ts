
import { FileType, FolderType } from '@/types/file';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

// Function to escape special characters in CSV content
const escapeCSV = (content: string): string => {
  // If content contains quotes, commas, or newlines, wrap it in quotes and escape internal quotes
  if (/[",\n\r]/.test(content)) {
    return `"${content.replace(/"/g, '""')}"`;
  }
  return content;
};

// Export single file as text
export const exportAsTxt = (file: FileType) => {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${file.name}.txt`);
};

// Export single file as PDF
export const exportAsPdf = (file: FileType) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(file.name, 20, 20);
  
  // Add content with word wrapping
  doc.setFontSize(12);
  const textLines = doc.splitTextToSize(file.content, 170);
  doc.text(textLines, 20, 30);
  
  doc.save(`${file.name}.pdf`);
};

// Export single file as CSV
export const exportAsCsv = (file: FileType) => {
  const csvContent = `Name,Content,Type,Created At\n${escapeCSV(file.name)},${escapeCSV(file.content)},${escapeCSV(file.type)},${file.created_at}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${file.name}.csv`);
};

// Export all files as CSV
export const exportAllFilesAsCsv = (files: FileType[], folders: FolderType[]) => {
  // Create CSV header
  let csvContent = 'Name,Type,Folder,Content,Created At\n';
  
  // Add files to CSV
  files.forEach(file => {
    const folderName = file.folder 
      ? folders.find(f => f.id === file.folder)?.name || '' 
      : '';
    
    csvContent += `${escapeCSV(file.name)},File,${escapeCSV(folderName)},${escapeCSV(file.content)},${file.created_at}\n`;
  });
  
  // Add folders to CSV
  folders.forEach(folder => {
    csvContent += `${escapeCSV(folder.name)},Folder,,${escapeCSV('')},${folder.created_at}\n`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'all_files_and_folders.csv');
};
