import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';

const UploadDropzone = ({ onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition ${
        isDragActive
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
          : 'border-slate-300 bg-slate-50 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800/50'
      }`}
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <>
          <FileText size={36} className="text-brand-600" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{selectedFile.name}</p>
          <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click or drop to replace</p>
        </>
      ) : (
        <>
          <UploadCloud size={36} className="text-slate-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Drag & drop a PDF here, or <span className="text-brand-600">browse</span>
          </p>
          <p className="text-xs text-slate-400">Only .pdf files are supported (max 20MB)</p>
        </>
      )}
    </div>
  );
};

export default UploadDropzone;
