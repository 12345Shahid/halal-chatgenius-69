
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { FileType } from '@/types/file';
import { exportAsTxt, exportAsPdf, exportAsCsv } from '@/utils/export-utils';

interface FileExportMenuProps {
  file: FileType;
}

const FileExportMenu = ({ file }: FileExportMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Download className="h-4 w-4" />
          <span className="sr-only">Export options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportAsTxt(file)}>
          Export as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsPdf(file)}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsCsv(file)}>
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FileExportMenu;
