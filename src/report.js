const fs = require('fs');
const path = require('path');
const { getSourceContext, formatFilePath } = require('./utils');

const LOG_FILE = path.join(process.cwd(), 'android', 'app', 'build', 'generated', 'logs', 'textBreakReport.txt');

// Ensure log directory exists
function ensureLogDir() {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Write to log file
function writeToLog(content) {
  ensureLogDir();
  fs.appendFileSync(LOG_FILE, content + '\n');
}

function writeSummary(buildState) {
  if (!buildState || buildState.files.size === 0) return;
  
  const lines = [];
  const SEP = '─'.repeat(80);
  
  lines.push('');
  lines.push(`${SEP}`);
  lines.push(`TEXT BREAK STRATEGY REPORT - Build: ${buildState.id}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`${SEP}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push('─'.repeat(40));
  lines.push(`Files modified : ${buildState.files.size}`);
  lines.push(`<Text> found   : ${buildState.counts.textFound}`);
  lines.push(`Attributes added:`);
  lines.push(`  - textBreakStrategy     : ${buildState.counts.textBreakStrategy}`);
  lines.push(`  - numberOfLines         : ${buildState.counts.numberOfLines}`);
  lines.push(`  - adjustsFontSizeToFit  : ${buildState.counts.adjustsFontSizeToFit}`);
  lines.push('');
  lines.push(`${SEP}`);
  lines.push('DETAILED CHANGES');
  lines.push(`${SEP}`);
  
  // Group by file
  for (const [filename, changes] of buildState.files) {
    lines.push('');
    lines.push(`[FILE] ${formatFilePath(filename)}`);
    lines.push(SEP);
    
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      lines.push(`  Line ${String(change.line).padStart(4)}, col ${String(change.col).padStart(3)} | <Text>`);
      lines.push(`    Added: ${change.added.join(', ')}`);
      
      // Show context if available
      if (change.sourceCode) {
        const context = getSourceContext(change.sourceCode, change.line - 1, 2);
        if (context) {
          for (let j = 0; j < context.lines.length; j++) {
            const l = context.lines[j];
            const marker = l.isTarget ? '▶ ' : '  ';
            const displayText = (l.text || '').substring(0, 70);
            lines.push(`    ${marker}${String(l.num).padStart(3)} | ${displayText}`);
          }
        }
      }
      lines.push('');
    }
  }
  
  lines.push(`${SEP}`);
  lines.push('END OF REPORT');
  lines.push(`${SEP}`);
  
  writeToLog(lines.join('\n'));
}

module.exports = {
  LOG_FILE,
  writeSummary
};
