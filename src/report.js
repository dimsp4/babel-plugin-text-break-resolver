const fs = require('fs');
const path = require('path');
const { getSourceContext, formatFilePath } = require('./utils');

const LOG_FILE = path.join(process.cwd(), 'android', 'app', 'build', 'generated', 'logs', 'textBreakReport.txt');
const STATE_FILE = path.join(process.cwd(), 'android', 'app', 'build', 'generated', 'logs', 'textBreakState.json');
const LOCK_DIR = path.join(process.cwd(), 'android', 'app', 'build', 'generated', 'logs', 'textBreakReport.lock');

// Ensure log directory exists
function ensureLogDir() {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Synchronous sleep for busy-wait lock acquisition
function syncSleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Wait
  }
}

function updateSharedState(buildState) {
  ensureLogDir();

  let acquired = false;
  let retries = 0;

  // Try to acquire atomic directory lock
  while (retries < 100 && !acquired) {
    try {
      fs.mkdirSync(LOCK_DIR);
      acquired = true;
    } catch (e) {
      if (e.code === 'EEXIST') {
        retries++;
        syncSleep(10); // Sleep 10ms and try again
      } else {
        break; // Other error, give up
      }
    }
  }

  if (!acquired) return null;

  try {
    let sharedState = { 
      files: [], 
      counts: { textFound: 0, textBreakStrategy: 0, numberOfLines: 0, adjustsFontSizeToFit: 0 },
      firstSeen: Date.now()
    };

    // Read existing state if valid
    if (fs.existsSync(STATE_FILE)) {
      const stats = fs.statSync(STATE_FILE);
      if (Date.now() - stats.mtimeMs < 60000) { // If modified within the last 60s, it's the current build session
        try {
          const loadedState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
          if (loadedState && loadedState.files) {
            sharedState = loadedState;
          }
        } catch (e) {
          // Parse error, ignore and start fresh
        }
      }
    }

    // Merge new findings (buildState.files is a Map)
    const currentFiles = new Map(sharedState.files); // sharedState.files is stored as an array of [key, val] pairs for JSON serialization
    
    for (const [filename, changes] of buildState.files) {
      if (!currentFiles.has(filename)) {
        currentFiles.set(filename, []);
      }
      const existingChanges = currentFiles.get(filename);
      currentFiles.set(filename, existingChanges.concat(changes));
    }
    
    sharedState.files = Array.from(currentFiles.entries());
    sharedState.counts.textFound += buildState.counts.textFound;
    sharedState.counts.textBreakStrategy += buildState.counts.textBreakStrategy;
    sharedState.counts.numberOfLines += buildState.counts.numberOfLines;
    sharedState.counts.adjustsFontSizeToFit += buildState.counts.adjustsFontSizeToFit;

    // Save merged state back to disk
    fs.writeFileSync(STATE_FILE, JSON.stringify(sharedState));

    return sharedState;
  } finally {
    // Always release lock
    try {
      fs.rmdirSync(LOCK_DIR);
    } catch (e) {}
  }
}

function writeSummary(buildState) {
  if (!buildState || buildState.files.size === 0) return;

  const sharedState = updateSharedState(buildState);
  if (!sharedState) return; // If we couldn't acquire lock, gracefully skip

  const lines = [];
  const SEP = '─'.repeat(80);

  lines.push('');
  lines.push(`${SEP}`);
  lines.push(`TEXT BREAK STRATEGY REPORT`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`${SEP}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push('─'.repeat(40));
  lines.push(`Files modified : ${sharedState.files.length}`);
  lines.push(`<Text> found   : ${sharedState.counts.textFound}`);
  lines.push(`Attributes added:`);
  lines.push(`  - textBreakStrategy     : ${sharedState.counts.textBreakStrategy}`);
  lines.push(`  - numberOfLines         : ${sharedState.counts.numberOfLines}`);
  lines.push(`  - adjustsFontSizeToFit  : ${sharedState.counts.adjustsFontSizeToFit}`);
  lines.push('');
  lines.push(`${SEP}`);
  lines.push('DETAILED CHANGES');
  lines.push(`${SEP}`);

  for (const [filename, changes] of sharedState.files) {
    lines.push('');
    lines.push(`[FILE] ${formatFilePath(filename)}`);
    lines.push(SEP);

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      lines.push(`  Line ${String(change.line).padStart(4)}, col ${String(change.col).padStart(3)} | <Text>`);
      lines.push(`    Added: ${change.added.join(', ')}`);

      // Show source context if available
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

  // Overwrite the log file with the fully merged, single-header report
  fs.writeFileSync(LOG_FILE, lines.join('\n') + '\n');
}

module.exports = {
  LOG_FILE,
  writeSummary
};
