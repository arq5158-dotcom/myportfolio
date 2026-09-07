import React, { useState, useRef } from 'react';
import {
  FiUploadCloud,
  FiUpload,
  FiTrash2,
  FiImage,
  FiFileText,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiPlus,
  FiExternalLink,
  FiX,
} from 'react-icons/fi';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  passwordGetter: () => string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  helperText?: string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  passwordGetter,
  aspectRatio = 'video',
  helperText,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', passwordGetter());

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      setError('Network error while uploading image.');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : 'aspect-[16/9]';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block font-semibold">
          {label}
        </label>
        {helperText && <span className="text-[10px] font-mono text-slate-500">{helperText}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif"
        className="hidden"
        onChange={onFileChange}
      />

      {value ? (
        <div className="rounded-2xl border border-white/[0.1] bg-white/[0.02] p-3 space-y-3">
          <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-black/40 border border-white/[0.06] group`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // fallback if broken path
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-light text-darker font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg"
              >
                <FiUpload className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="px-3.5 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <FiCheck className="w-3.5 h-3.5" />
              <span>Image active & ready</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
              >
                {uploading ? (
                  <>
                    <FiRefreshCw className="w-3 h-3 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="w-3 h-3" />
                    <span>Upload New</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragActive
              ? 'border-primary bg-primary/10'
              : 'border-white/[0.12] hover:border-primary/60 bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              {uploading ? (
                <FiRefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <FiUploadCloud className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono font-medium text-white">
                {uploading ? 'Uploading image to portfolio...' : 'Click or drop image to upload'}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                Supports PNG, JPG, WebP, SVG, AVIF (Max 10MB)
              </p>
            </div>
            <button
              type="button"
              disabled={uploading}
              className="mt-2 px-4 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-darker border border-primary/30 font-mono text-xs font-bold uppercase tracking-wider transition-all"
            >
              {uploading ? 'Processing...' : 'Choose File'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface GalleryUploaderProps {
  label: string;
  images: string[];
  onChange: (urls: string[]) => void;
  passwordGetter: () => string;
  helperText?: string;
}

export function GalleryUploader({
  label,
  images,
  onChange,
  passwordGetter,
  helperText,
}: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressMsg(`Uploading ${i + 1} of ${files.length}...`);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', passwordGetter());

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          setError(data.error || `Failed to upload ${file.name}`);
        }
      } catch (err) {
        setError(`Network error uploading ${file.name}`);
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
    setUploading(false);
    setProgressMsg(null);
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block font-semibold">
          {label} ({images.length})
        </label>
        {helperText && <span className="text-[10px] font-mono text-slate-500">{helperText}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="group relative aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-white/[0.08]"
          >
            <img
              src={url}
              alt={`Screenshot ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-1.5 right-1.5">
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-white/80 hover:text-white transition-colors"
                title="Remove Screenshot"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 font-mono text-[9px] text-white/70">
              #{idx + 1}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="aspect-[16/9] rounded-xl border-2 border-dashed border-white/[0.12] hover:border-primary/60 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-primary p-3"
        >
          {uploading ? (
            <>
              <FiRefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span className="text-[10px] font-mono text-primary font-bold">
                {progressMsg || 'Uploading...'}
              </span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <FiPlus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono font-medium">Add Screenshot</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface DocumentUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  passwordGetter: () => string;
  isResume?: boolean;
}

export function DocumentUploader({
  label,
  value = '/assets/resume.pdf',
  onChange,
  passwordGetter,
  isResume = true,
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', passwordGetter());
      if (isResume) {
        formData.append('isResume', 'true');
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
        setSuccessMsg('Document successfully uploaded & published!');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      setError('Network error while uploading document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <FiFileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-white">{label}</h4>
            <p className="text-[10px] font-mono text-slate-400">
              {isResume ? 'Directly controls the Résumé (PDF) link across the portfolio' : 'PDF Document'}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex items-center gap-2">
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <FiExternalLink className="w-3 h-3 text-primary" />
              <span>Preview</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-light text-darker font-mono text-xs font-bold uppercase transition-all shadow-md shadow-primary/20"
          >
            {uploading ? (
              <>
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FiUpload className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <FiCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
          <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface TagManagerProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  helperText?: string;
  placeholder?: string;
}

export function TagManager({
  label,
  tags,
  onChange,
  helperText,
  placeholder = 'Add new tag...',
}: TagManagerProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-between justify-between">
        <label className="text-xs font-mono text-slate-400 block uppercase font-semibold">
          {label}
        </label>
        {helperText && <span className="text-[10px] font-mono text-slate-500">{helperText}</span>}
      </div>

      <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] min-h-[48px] items-center">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.12] text-xs font-mono text-slate-200"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <FiX className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex items-center gap-1 flex-1 min-w-[140px]">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent px-2 py-1 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
          />
          {newTag && (
            <button
              type="button"
              onClick={addTag}
              className="px-2 py-1 rounded bg-primary/20 hover:bg-primary text-primary hover:text-darker text-[10px] font-mono font-bold uppercase transition-all"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FeatureListEditorProps {
  label: string;
  features: string[];
  onChange: (features: string[]) => void;
}

export function FeatureListEditor({ label, features, onChange }: FeatureListEditorProps) {
  const updateItem = (index: number, val: string) => {
    const next = [...features];
    next[index] = val;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...features, 'New capability feature description']);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-slate-400 block uppercase font-semibold">
          {label} ({features.length})
        </label>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 text-xs font-mono text-primary hover:underline"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Add Feature Point</span>
        </button>
      </div>

      <div className="space-y-2">
        {features.map((feat, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 w-5 text-right shrink-0">
              {idx + 1}.
            </span>
            <input
              type="text"
              value={feat}
              onChange={(e) => updateItem(idx, e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white font-mono focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Delete feature point"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

