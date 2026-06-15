const fs = require('fs');
const { isNodeModules } = require('./utils');
const { LOG_FILE, writeSummary } = require('./report');

// Build state (accumulates across all transforms in a build)
let buildState = null;
let buildId = null;

// Attributes to add
const ATTRS_TO_ADD = [
  { name: 'textBreakStrategy', value: 'simple', type: 'string' },
  { name: 'numberOfLines', value: 1, type: 'number' },
  { name: 'adjustsFontSizeToFit', value: true, type: 'boolean' }
];

// Initialize build state
function initBuild() {
  if (!buildId) {
    buildId = Date.now().toString(36).toUpperCase();
    // (File deletion is now safely handled by the atomic overwrite in report.js)
    buildState = {
      id: buildId,
      startTime: new Date().toISOString(),
      files: new Map(),
      seenLocations: new Set(),
      counts: {
        textFound: 0,
        textBreakStrategy: 0,
        numberOfLines: 0,
        adjustsFontSizeToFit: 0
      }
    };
  }
  return buildState;
}

module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: 'text-break-strategy',
    
    visitor: {
      JSXElement(path, state) {
        const openingElement = path.node.openingElement;

        // Only process <Text> elements
        if (openingElement.name.name !== 'Text') return;
        if (openingElement.selfClosing) return;

        const filename = state.filename || 'unknown';
        
        // Skip node_modules - only process user code
        if (isNodeModules(filename)) return;

        const state2 = initBuild();
        
        // Get component location
        const loc = path.node.loc;
        const line = loc.start.line;
        const col = loc.start.column;

        // Deduplicate: skip if we've already processed this location
        const locationKey = `${filename}:${line}:${col}`;
        if (state2.seenLocations.has(locationKey)) return;
        state2.seenLocations.add(locationKey);

        state2.counts.textFound++;
        
        const attrs = openingElement.attributes;
        
        // Build Set of existing attribute names (single pass)
        const existingAttrs = new Set();
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          if (attr.type === 'JSXAttribute' && attr.name) {
            existingAttrs.add(attr.name.name);
          }
        }
        
        // Check which attributes need to be added
        const toAdd = [];
        for (let i = 0; i < ATTRS_TO_ADD.length; i++) {
          const attrDef = ATTRS_TO_ADD[i];
          if (!existingAttrs.has(attrDef.name)) {
            toAdd.push(attrDef);
            
            // Update counts
            switch (attrDef.name) {
              case 'textBreakStrategy':
                state2.counts.textBreakStrategy++;
                break;
              case 'numberOfLines':
                state2.counts.numberOfLines++;
                break;
              case 'adjustsFontSizeToFit':
                state2.counts.adjustsFontSizeToFit++;
                break;
            }
          }
        }
        
        // Skip if nothing was added
        if (toAdd.length === 0) return;
        
        // Add missing attributes
        for (let i = 0; i < toAdd.length; i++) {
          const attrDef = toAdd[i];
          let literalValue;
          
          if (attrDef.type === 'boolean') {
            literalValue = t.booleanLiteral(attrDef.value);
          } else if (attrDef.type === 'number') {
            literalValue = t.numericLiteral(attrDef.value);
          } else {
            literalValue = t.stringLiteral(attrDef.value);
          }
          
          attrs.push(t.jSXAttribute(t.jSXIdentifier(attrDef.name), t.jsxExpressionContainer(literalValue)));
        }
        
        // Track what we added
        const added = toAdd.map(a => a.name);
        
        // Only get source code for user files (for context display)
        const sourceCode = (path.hub && path.hub.file && path.hub.file.code) || '';
        
        // Track by file
        if (!state2.files.has(filename)) {
          state2.files.set(filename, []);
        }
        state2.files.get(filename).push({ line, col, added, sourceCode });
      }
    }
  };
};

// Write summary at the end of build
process.on('exit', () => {
  if (buildState) {
    writeSummary(buildState);
  }
});
