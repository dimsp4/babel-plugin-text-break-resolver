const path = require('path');

// Helper to extract lines around a location
function getSourceContext(code, line, contextLines = 2) {
  if (!code) return null;
  const lines = code.split('\n');
  const startLine = Math.max(0, line - contextLines);
  const endLine = Math.min(lines.length - 1, line + contextLines);
  const result = [];
  
  for (let i = startLine; i <= endLine; i++) {
    result.push({
      num: i + 1,
      text: lines[i],
      isTarget: i === line
    });
  }
  
  return { startLine: startLine + 1, endLine: endLine + 1, lines: result };
}

// Format file path for display (show relative to src if possible)
function formatFilePath(filepath) {
  const parts = filepath.split('/');
  const srcIndex = parts.findIndex(p => p === 'src');
  if (srcIndex >= 0) {
    return parts.slice(srcIndex).join('/');
  }
  return filepath.split('/').slice(-3).join('/');
}

// Check if file is in node_modules
function isNodeModules(filename) {
  return filename.includes('node_modules');
}

module.exports = {
  getSourceContext,
  formatFilePath,
  isNodeModules
};
