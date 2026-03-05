import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadCSV } from '../services/api'
import toast from 'react-hot-toast'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a CSV file first.'); return }
    setUploading(true)
    setResult(null)
    try {
      const data = await uploadCSV(file)
      setResult(data)
      toast.success(`Processed ${data.processed} comments!`)
    } catch (e) {
      const msg = e.response?.data?.detail || 'Upload failed. Check the backend is running.'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const counts = result?.counts || {}
  const total = result?.processed || 0

  return (
    <div className="max-w-2xl mx-auto space-y-8 slide-up">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Upload CSV Dataset</h1>
        <p className="text-gray-400 mt-1">Batch analyze thousands of comments from a CSV file</p>
      </div>

      {/* Format hint */}
      <div className="glass-card p-4 text-sm text-gray-400 space-y-1">
        <p className="font-medium text-gray-200">📋 Expected CSV Format</p>
        <p>Your CSV must have a column named <code className="text-violet-300 bg-violet-900/30 px-1 rounded">comment</code> or <code className="text-violet-300 bg-violet-900/30 px-1 rounded">text</code>.</p>
        <pre className="mt-2 bg-black/30 rounded-lg p-3 text-xs text-green-300 overflow-x-auto">
{`id,comment
1,"I love this product, it is amazing!"
2,"Worst service I have ever experienced."
3,"Delivery was on time, product is okay."`}
        </pre>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`glass-card p-12 text-center cursor-pointer border-2 border-dashed transition-all ${
          isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-violet-500/50 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-4">📁</div>
        {isDragActive ? (
          <p className="text-violet-300 font-medium">Drop the CSV file here...</p>
        ) : (
          <>
            <p className="text-gray-300 font-medium">Drag & drop your CSV file here</p>
            <p className="text-gray-500 text-sm mt-1">or click to select a file</p>
          </>
        )}
        {file && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-900/30 text-violet-300 text-sm border border-violet-500/30">
            ✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2"
      >
        {uploading ? <><div className="spinner" /> Processing...</> : '🚀 Upload & Analyze'}
      </button>

      {/* Result */}
      {result && (
        <div className="glass-card p-6 space-y-4 slide-up">
          <h3 className="font-semibold text-lg text-white">✅ Analysis Complete</h3>
          <p className="text-gray-400 text-sm">{result.message}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Positive', count: counts.positive || 0, color: 'text-green-400', bg: 'bg-green-900/20', emoji: '😊' },
              { label: 'Negative', count: counts.negative || 0, color: 'text-red-400', bg: 'bg-red-900/20', emoji: '😞' },
              { label: 'Neutral',  count: counts.neutral || 0,  color: 'text-yellow-400', bg: 'bg-yellow-900/20', emoji: '😐' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center border border-white/10`}>
                <div className="text-2xl">{s.emoji}</div>
                <div className={`text-xl font-bold ${s.color} mt-1`}>{s.count}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {total > 0 ? `${((s.count / total) * 100).toFixed(1)}%` : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
