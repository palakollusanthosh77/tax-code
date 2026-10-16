import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, FileText, X, Loader2 } from 'lucide-react';
import { getDocumentsApi, uploadDocumentApi, deleteDocumentApi } from '../api/documentApi';
import DocumentCard from '../components/documents/DocumentCard';
import UploadDropzone from '../components/documents/UploadDropzone';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';

const CATEGORIES = ['GST', 'Income Tax', 'Companies Act', 'Customs', 'RBI', 'SEBI', 'Other'];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getDocumentsApi({ search: debouncedSearch, category, page, limit: 9 });
      setDocuments(data.data);
      setPages(data.meta?.pages || 1);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document? This will also remove it from AI search.')) return;
    try {
      await deleteDocumentApi(id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Regulatory Document Library</h1>
          <p className="text-sm text-slate-400">Upload GST, Income Tax, and other regulatory PDFs for AI-powered search.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Upload Document
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search documents by title or tag..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="input-field sm:w-56"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader size="lg" label="Loading documents..." />
      ) : documents.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onDelete={handleDelete}
                canDelete={user.role === 'admin' || doc.uploadedBy?._id === user.id}
              />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Upload a regulatory PDF to start building your searchable compliance library."
          action={
            <button className="btn-primary mt-2" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Upload your first document
            </button>
          }
        />
      )}

      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onUploaded={() => {
            setShowModal(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
};

const UploadModal = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a PDF file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('category', category);
    formData.append('description', description);

    setUploading(true);
    try {
      await uploadDocumentApi(formData, (evt) => setProgress(Math.round((evt.loaded * 100) / evt.total)));
      toast.success('Document uploaded! Processing & indexing in the background.');
      onUploaded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Upload Regulatory Document</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <UploadDropzone onFileSelected={setFile} />

          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="e.g. GST Late Filing Circular 2026" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input-field" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {uploading && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading && <Loader2 size={16} className="animate-spin" />}
              Upload & Index
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Documents;
