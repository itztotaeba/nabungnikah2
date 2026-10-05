#!/usr/bin/env node

/**
 * Color Theme Migration Script
 * Mengganti semua warna lama (Sage Green & Rose Gold) dengan warna baru (Forest Green & Warm Gold)
 */

const fs = require('fs');
const path = require('path');

// Mapping warna lama ke baru
const COLOR_MAP = {
  // Primary - Forest Green
  '#87A878': '#2F6A43',
  '#6B8A5E': '#1E4A2E',
  '#A8C49A': '#4A9B65',
  
  // Secondary - Warm Gold
  '#B76E79': '#D4A843',
  '#9A5560': '#B8922F',
  '#C4838C': '#E0BC6A',
  '#D4959E': '#E8CC8A',
  
  // Backgrounds
  '#FDFBF7': '#FAF8F4',
  '#F5F0E8': '#F3EFE6',
  '#E8E0D4': '#D6E5DC',
};

// Files to process
const FILES = [
  'src/components/Dashboard.tsx',
  'src/components/BudgetManager.tsx',
  'src/components/SavingsTracker.tsx',
  'src/components/GuestManager.tsx',
  'src/components/VendorManager.tsx',
  'src/components/TimelineManager.tsx',
  'src/components/Settings.tsx',
  'src/components/AuthModal.tsx',
  'src/components/AuthPage.tsx',
  'src/components/CloudSyncSection.tsx',
  'src/components/CollaborationSection.tsx',
  'src/components/LiveSyncIndicator.tsx',
  'src/components/LoadingOverlay.tsx',
  'src/components/ComparisonAnalysis.tsx',
  'src/components/BudgetPieChart.tsx',
  'src/components/SavingsLineChart.tsx',
  'src/components/DeadlineCalendar.tsx',
  'src/components/ToastContainer.tsx',
  'src/components/Modal.tsx',
  'src/components/SyncIndicator.tsx',
  'src/helpers/pdfGenerator.ts',
];

function replaceColors(content) {
  let result = content;
  for (const [oldColor, newColor] of Object.entries(COLOR_MAP)) {
    // Replace both uppercase and lowercase
    const regex = new RegExp(oldColor, 'gi');
    result = result.replace(regex, newColor);
  }
  return result;
}

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const newContent = replaceColors(content);
  
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
  }
}

// Process all files
console.log('🎨 Starting color theme migration...\n');
FILES.forEach(processFile);
console.log('\n✨ Migration complete!');
