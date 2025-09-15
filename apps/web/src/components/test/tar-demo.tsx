// import { useState } from 'react'
// import { createWebFS, downloadAndExtractTarGz, packFolderToTarGz, UniversalFS } from '@jaculus/jacly/web'

// export function TarDemo() {
//   const [fs, setFs] = useState<UniversalFS | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [files, setFiles] = useState<string[]>([])
//   const [selectedFile, setSelectedFile] = useState<string>('')
//   const [fileContent, setFileContent] = useState<string>('')
//   const [status, setStatus] = useState<string>('')

//   // Initialize filesystem
//   const initFS = async (useOPFS = false) => {
// 	setLoading(true)
// 	setStatus('Initializing filesystem...')
// 	try {
// 	  const newFs = await createWebFS(useOPFS)
// 	  setFs(newFs)
// 	  setStatus('Filesystem initialized')
// 	  await refreshFiles(newFs)
// 	} catch (_error) {
// 	  setStatus(`Error: ${_error}`)
// 	} finally {
// 	  setLoading(false)
// 	}
//   }

//   // Refresh file list
//   const refreshFiles = async (filesystem = fs) => {
// 	if (!filesystem) return
// 	try {
// 	  const items = await filesystem.readdir('/data')
// 	  setFiles(items)
// 	} catch (_error) {
// 	  // Directory might not exist yet
// 	  setFiles([])
// 	}
//   }

//   // Download and extract tar.gz from URL
//   const downloadTarGz = async () => {
// 	if (!fs) return
// 	const url = prompt('Enter tar.gz URL:', 'https://f.jaculus.org/bin/ESP32-S3-Generic-NoPSRAM/ESP32-S3-Generic-NoPSRAM-0.0.20.tar.gz')
// 	if (!url) return

// 	setLoading(true)
// 	setStatus('Downloading and extracting...')
// 	try {
// 	  await downloadAndExtractTarGz(url, fs, '/data')
// 	  setStatus('Downloaded and extracted successfully')
// 	  await refreshFiles()
// 	} catch (_error) {
// 	  setStatus(`Error: ${_error}`)
// 	} finally {
// 	  setLoading(false)
// 	}
//   }

//   // Upload and extract local tar.gz file
//   const uploadTarGz = async (event: React.ChangeEvent<HTMLInputElement>) => {
// 	if (!fs || !event.target.files?.[0]) return

// 	const file = event.target.files[0]
// 	setLoading(true)
// 	setStatus('Processing uploaded file...')

// 	try {
// 	  const arrayBuffer = await file.arrayBuffer()
// 	  const gz = new Uint8Array(arrayBuffer)

// 	  // Create a temporary URL for the uploaded file
// 	  const blob = new Blob([gz], { type: 'application/gzip' })
// 	  const url = URL.createObjectURL(blob)

// 	  await downloadAndExtractTarGz(url, fs, '/data')
// 	  URL.revokeObjectURL(url)

// 	  setStatus('Uploaded and extracted successfully')
// 	  await refreshFiles()
// 	} catch (_error) {
// 	  setStatus(`Error: ${_error}`)
// 	} finally {
// 	  setLoading(false)
// 	  // Clear the input
// 	  event.target.value = ''
// 	}
//   }

//   // Read file content
//   const readFile = async (filename: string) => {
// 	if (!fs) return
// 	try {
// 	  const data = await fs.readFile(`/data/${filename}`)
// 	  const content = new TextDecoder().decode(data)
// 	  setFileContent(content)
// 	  setSelectedFile(filename)
// 	} catch (_error) {
// 	  setStatus(`Error reading file: ${_error}`)
// 	}
//   }

//   // Save file content
//   const saveFile = async () => {
// 	if (!fs || !selectedFile) return
// 	try {
// 	  const data = new TextEncoder().encode(fileContent)
// 	  await fs.writeFile(`/data/${selectedFile}`, data)
// 	  setStatus('File saved successfully')
// 	} catch (_error) {
// 	  setStatus(`Error saving file: ${_error}`)
// 	}
//   }

//   // Create new file
//   const createFile = async () => {
// 	if (!fs) return
// 	const filename = prompt('Enter filename:')
// 	if (!filename) return

// 	try {
// 	  const data = new TextEncoder().encode('// New file\n')
// 	  await fs.writeFile(`/data/${filename}`, data)
// 	  setStatus('File created successfully')
// 	  await refreshFiles()
// 	} catch (_error) {
// 	  setStatus(`Error creating file: ${_error}`)
// 	}
//   }

//   // Pack and download as tar.gz
//   const downloadAsTarGz = async () => {
// 	if (!fs) return
// 	setLoading(true)
// 	setStatus('Creating tar.gz...')
// 	try {
// 	  const blob = await packFolderToTarGz(fs, '/data')

// 	  // Create download link
// 	  const a = document.createElement('a')
// 	  a.href = URL.createObjectURL(blob)
// 	  a.download = 'edited.tar.gz'
// 	  document.body.appendChild(a)
// 	  a.click()
// 	  document.body.removeChild(a)
// 	  URL.revokeObjectURL(a.href)

// 	  setStatus('Download started')
// 	} catch (_error) {
// 	  setStatus(`Error: ${_error}`)
// 	} finally {
// 	  setLoading(false)
// 	}
//   }

//   return (
// 	<div className="p-6 max-w-6xl mx-auto">
// 	  <h1 className="text-3xl font-bold mb-6">Tar.gz Demo</h1>

// 	  {/* Status */}
// 	  <div className="mb-4 p-3 bg-gray-100 rounded">
// 		<strong>Status:</strong> {status}
// 	  </div>

// 	  {/* Initialize FS */}
// 	  {!fs && (
// 		<div className="mb-6 space-y-2">
// 		  <h2 className="text-xl font-semibold">Initialize Filesystem</h2>
// 		  <div className="space-x-2">
// 			<button
// 			  onClick={() => initFS(false)}
// 			  disabled={loading}
// 			  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
// 			>
// 			  Use IndexedDB
// 			</button>
// 			<button
// 			  onClick={() => initFS(true)}
// 			  disabled={loading}
// 			  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
// 			>
// 			  Use File System Access API (OPFS)
// 			</button>
// 		  </div>
// 		</div>
// 	  )}

// 	  {fs && (
// 		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// 		  {/* Left Panel - File Operations */}
// 		  <div className="space-y-4">
// 			<h2 className="text-xl font-semibold">File Operations</h2>

// 			{/* Download from URL */}
// 			<div>
// 			  <button
// 				onClick={downloadTarGz}
// 				disabled={loading}
// 				className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
// 			  >
// 				Download tar.gz from URL
// 			  </button>
// 			</div>

// 			{/* Upload local file */}
// 			<div>
// 			  <label className="block">
// 				<span className="text-sm font-medium">Upload local tar.gz:</span>
// 				<input
// 				  type="file"
// 				  accept=".tar.gz,.tgz"
// 				  onChange={uploadTarGz}
// 				  disabled={loading}
// 				  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
// 				/>
// 			  </label>
// 			</div>

// 			{/* File list */}
// 			<div>
// 			  <div className="flex justify-between items-center mb-2">
// 				<h3 className="font-semibold">Files in /data:</h3>
// 				<div className="space-x-2">
// 				  <button
// 					onClick={() => refreshFiles()}
// 					disabled={loading}
// 					className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
// 				  >
// 					Refresh
// 				  </button>
// 				  <button
// 					onClick={createFile}
// 					disabled={loading}
// 					className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
// 				  >
// 					New File
// 				  </button>
// 				</div>
// 			  </div>

// 			  <div className="border rounded p-2 max-h-40 overflow-y-auto">
// 				{files.length === 0 ? (
// 				  <p className="text-gray-500">No files found</p>
// 				) : (
// 				  <ul className="space-y-1">
// 					{files.map(file => (
// 					  <li key={file}>
// 						<button
// 						  onClick={() => readFile(file)}
// 						  className="text-blue-600 hover:underline"
// 						>
// 						  {file}
// 						</button>
// 					  </li>
// 					))}
// 				  </ul>
// 				)}
// 			  </div>
// 			</div>

// 			{/* Download as tar.gz */}
// 			<div>
// 			  <button
// 				onClick={downloadAsTarGz}
// 				disabled={loading || files.length === 0}
// 				className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
// 			  >
// 				Download as tar.gz
// 			  </button>
// 			</div>
// 		  </div>

// 		  {/* Right Panel - File Editor */}
// 		  <div className="space-y-4">
// 			<h2 className="text-xl font-semibold">File Editor</h2>

// 			{selectedFile ? (
// 			  <div className="space-y-2">
// 				<div className="flex justify-between items-center">
// 				  <h3 className="font-semibold">Editing: {selectedFile}</h3>
// 				  <button
// 					onClick={saveFile}
// 					disabled={loading}
// 					className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
// 				  >
// 					Save
// 				  </button>
// 				</div>

// 				<textarea
// 				  value={fileContent}
// 				  onChange={(e) => setFileContent(e.target.value)}
// 				  className="w-full h-96 p-3 border rounded font-mono text-sm"
// 				  placeholder="File content..."
// 				/>
// 			  </div>
// 			) : (
// 			  <p className="text-gray-500">Select a file to edit</p>
// 			)}
// 		  </div>
// 		</div>
// 	  )}

// 	  {loading && (
// 		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
// 		  <div className="bg-white p-4 rounded">
// 			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
// 			<p className="mt-2">Loading...</p>
// 		  </div>
// 		</div>
// 	  )}
// 	</div>
//   )
// }
