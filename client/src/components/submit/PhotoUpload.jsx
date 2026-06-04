import { useRef, useState } from 'react'

export default function PhotoUpload({ file, onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const preview = file ? URL.createObjectURL(file) : null

  const pick = (f) => {
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        pick(e.dataTransfer.files?.[0])
      }}
      className={`group relative w-full overflow-hidden rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 ${
        dragging
          ? 'border-green-400 bg-green-400/10'
          : 'border-green-400/30 bg-white/5 hover:border-green-400/60 hover:bg-white/[0.07]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {preview ? (
        <img
          src={preview}
          alt="Your plant"
          className="mx-auto max-h-48 w-auto rounded-xl object-cover"
        />
      ) : (
        <>
          <span className="mb-4 inline-block text-4xl">📷</span>
          <p className="font-bold text-white">Click to upload your photo</p>
          <p className="mt-1 text-sm text-white/70">or drag and drop here</p>
          <p className="mt-3 text-xs text-white/40">
            JPG, PNG up to 10MB · AI verifies your plant automatically
          </p>
        </>
      )}

      {preview && (
        <span className="mt-3 block text-xs text-green-300/80">
          Click to change photo
        </span>
      )}
    </button>
  )
}
