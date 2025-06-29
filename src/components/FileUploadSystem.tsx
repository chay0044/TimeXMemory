import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, File, Image, Video, Music, FileText, X, Check, AlertCircle, Download, Eye, Trash2, Share2, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { uploadFile, getUserFiles, deleteFile, UploadedFile } from '../lib/supabase';

interface FileUploadSystemProps {
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  maxFiles?: number;
  onFilesUploaded?: (files: UploadedFile[]) => void;
}

const FileUploadSystem: React.FC<FileUploadSystemProps> = ({
  maxFileSize = 100,
  allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt'],
  maxFiles = 10,
  onFilesUploaded
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserFiles();
    }
  }, [user, selectedCategory]);

  const fetchUserFiles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getUserFiles(user.id, selectedCategory);

      if (fetchError) throw fetchError;

      setFiles(data || []);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isAllowed) {
      return 'File type not supported';
    }

    return null;
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    if (!user) {
      setError('You must be logged in to upload files');
      return;
    }

    const validFiles: File[] = [];
    
    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        alert(`${file.name}: ${validationError}`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = validFiles.map(file => 
        uploadFile(file, user.id, 'general')
      );

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads: UploadedFile[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.error) {
          errors.push(`${validFiles[index].name}: ${result.error.message}`);
        } else if (result.data) {
          successfulUploads.push(result.data);
        }
      });

      if (errors.length > 0) {
        setError(`Some uploads failed: ${errors.join(', ')}`);
      }

      if (successfulUploads.length > 0) {
        await fetchUserFiles(); // Refresh the file list
        
        if (onFilesUploaded) {
          onFilesUploaded(successfulUploads);
        }

        alert(`✅ Successfully uploaded ${successfulUploads.length} file(s)!`);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [files.length, maxFiles, maxFileSize, allowedTypes, onFilesUploaded, user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await deleteFile(fileId, user.id);
      
      if (error) throw error;

      await fetchUserFiles(); // Refresh the file list
      alert('✅ File deleted successfully!');
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('❌ Failed to delete file');
    }
  };

  const filteredFiles = files.filter(file => 
    selectedCategory === 'all' || file.category === selectedCategory
  );

  const categories = [
    { id: 'all', label: 'All Files', count: files.length },
    { id: 'image', label: 'Images', count: files.filter(f => f.category === 'image').length },
    { id: 'video', label: 'Videos', count: files.filter(f => f.category === 'video').length },
    { id: 'audio', label: 'Audio', count: files.filter(f => f.category === 'audio').length },
    { id: 'document', label: 'Documents', count: files.filter(f => f.category === 'document').length },
    { id: 'other', label: 'Other', count: files.filter(f => f.category === 'other').length },
  ];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400">You need to be signed in to upload and manage files.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          File Upload & Management
        </h2>
        <p className="text-gray-400">Upload and organize your memories, documents, and media files</p>
      </div>

      {/* Upload Area */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-gray-600 hover:border-cyan-500/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Uploading Files...</h3>
              <p className="text-gray-400">Please wait while your files are being uploaded</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {isDragging ? 'Drop files here' : 'Upload Files'}
              </h3>
              <p className="text-gray-400 mb-4">
                Drag and drop files here, or click to browse
              </p>
              
              <div className="space-y-2 text-sm text-gray-400 mb-6">
                <p>Supported formats: Images, Videos, Audio, Documents</p>
                <p>Maximum file size: {maxFileSize}MB</p>
                <p>Maximum files: {maxFiles}</p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:cursor-not-allowed"
              >
                Choose Files
              </button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* File Management */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="w-4 h-4 flex flex-col gap-1">
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your files...</p>
          </div>
        )}

        {/* Files Display */}
        {!loading && (
          <>
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No files yet</h3>
                <p className="text-gray-400">Upload your first file to get started!</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map(file => {
                  const Icon = getFileIcon(file.category);
                  return (
                    <div key={file.id} className="bg-gray-800 rounded-lg overflow-hidden">
                      {/* Thumbnail/Preview */}
                      <div className="relative h-32 bg-gray-700 flex items-center justify-center">
                        {file.category === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon className="w-8 h-8 text-gray-400" />
                        )}
                        
                        {/* Status Indicator */}
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-green-400 bg-black/50 rounded-full p-1" />
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-white truncate mb-1">{file.name}</h4>
                        <p className="text-xs text-gray-400 mb-2">{formatFileSize(file.size)}</p>
                        
                        {/* Actions */}
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => window.open(file.url, '_blank')}
                              className="p-1 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = file.url;
                                a.download = file.name;
                                a.click();
                              }}
                              className="p-1 text-gray-400 hover:text-green-400 transition-colors duration-200"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigator.share?.({ url: file.url, title: file.name })}
                              className="p-1 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredFiles.map(file => {
                  const Icon = getFileIcon(file.category);
                  return (
                    <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                        {file.category === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Icon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{file.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.created_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-400" />
                        
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploadSystem;