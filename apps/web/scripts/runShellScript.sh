
#!/bin/bash

# Pack a directory into a tar.gz archive
function generateTarGz() {
  local sourceDir=$1
  local outTarGzPath=$2

  if [ ! -d "$sourceDir" ]; then
    echo "Error: Source directory does not exist: $sourceDir"
    return 1
  fi

  # Create output directory if it doesn't exist
  local outDir=$(dirname "$outTarGzPath")
  mkdir -p "$outDir"

  # Create tar.gz archive (contents only, without the directory wrapper)
  # Exclude macOS metadata files
  tar -czf "$outTarGzPath" -C "$sourceDir" \
    --exclude='._*' \
    --exclude='.DS_Store' \
    --exclude='__MACOSX' \
    .

  if [ $? -eq 0 ]; then
    echo "Created tar.gz archive $outTarGzPath"
  else
    echo "Error: Failed to create tar.gz archive"
    return 1
  fi
}

# Pack a directory into a zip archive
function generateZip() {
  local sourceDir=$1
  local outZipPath=$2

  if [ ! -d "$sourceDir" ]; then
    echo "Error: Source directory does not exist: $sourceDir"
    return 1
  fi

  # Create output directory if it doesn't exist
  local outDir=$(dirname "$outZipPath")
  mkdir -p "$outDir"

  # Create zip archive (recursively including all files)
  # Exclude macOS metadata files
  zip -r "$outZipPath" "$sourceDir" \
    -x '*/._*' '*.DS_Store' '*/__MACOSX'

  if [ $? -eq 0 ]; then
    echo "Created zip archive $outZipPath"
  else
    echo "Error: Failed to create zip archive"
    return 1
  fi
}

generateZip "../../test/data/test-project" "public/project.zip"
generateTarGz "../../test/data/test-project" "public/project.tar.gz"
