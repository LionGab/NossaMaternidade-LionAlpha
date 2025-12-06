#!/usr/bin/env node
/**
 * Script para remover imports não utilizados
 * Renomeia imports não utilizados para começar com _ para passar no linter
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // CreatePostModal.tsx
  { file: 'src/components/community/CreatePostModal.tsx', remove: ['MessageCircle', 'X', 'Loader2'] },

  // PostCard.tsx
  { file: 'src/components/community/PostCard.tsx', remove: ['View', 'ColorTokens'], removeVars: ['isDark'] },

  // BadgeUnlocker.tsx
  { file: 'src/components/guilt/BadgeUnlocker.tsx', remove: ['ScrollView'] },

  // GuiltSelector.tsx
  { file: 'src/components/guilt/GuiltSelector.tsx', remove: ['ActivityIndicator'], removeVars: ['colors', 'index'] },

  // CreateHabitModal.tsx
  { file: 'src/components/habits/CreateHabitModal.tsx', remove: ['Loader2', 'View'] },

  // HabitCard.tsx
  { file: 'src/components/habits/HabitCard.tsx', remove: ['Loader2', 'ProgressBar'], removeVars: ['isDark'] },

  // ContentCategorySection.tsx
  { file: 'src/components/mundo-nath/ContentCategorySection.tsx', remove: ['Sparkles'] },

  // DailySpecialCard.tsx
  { file: 'src/components/mundo-nath/DailySpecialCard.tsx', remove: ['BookOpen', 'Heart', 'View', 'LinearGradient'] },

  // FeaturedVideo.tsx
  { file: 'src/components/mundo-nath/FeaturedVideo.tsx', remove: ['Star', 'TouchableOpacity', 'StyleSheet'], removeVars: ['rating'] },

  // MundoNathHeader.tsx
  { file: 'src/components/mundo-nath/MundoNathHeader.tsx', remove: ['ScrollView'] },

  // AudioGuide.tsx
  { file: 'src/components/ritual/AudioGuide.tsx', removeVars: ['setVolume'] },

  // BreathingExercise.tsx
  { file: 'src/components/ritual/BreathingExercise.tsx', removeVars: ['logger'] },

  // EmpathyAudioPlayer.tsx
  { file: 'src/components/sos/EmpathyAudioPlayer.tsx', remove: ['logger'], removeVars: ['setVolume'] },

  // SOSMaeFloatingButton.tsx
  { file: 'src/components/sos/SOSMaeFloatingButton.tsx', remove: ['StyleSheet', 'withSequence', 'Text'], removeVars: ['colors', 'isPressed'] },

  // CommunityScreen.tsx
  { file: 'src/screens/CommunityScreen.tsx', remove: ['Image', 'LinearGradient', 'Sparkles', 'Loader2', 'StyleSheet', 'FlatList', 'Badge', 'Shadows'], removeVars: ['handleLoadMore'] },

  // DesculpaHojeScreen.tsx
  { file: 'src/screens/DesculpaHojeScreen.tsx', remove: ['Heart', 'Platform'] },

  // HabitsScreen.tsx
  { file: 'src/screens/HabitsScreen.tsx', remove: ['Haptics', 'Sparkles', 'Button'], removeVars: ['insets'] },
];

fixes.forEach(({ file, remove = [], removeVars = [] }) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remover imports
  remove.forEach(name => {
    // Remover import na linha (ex: "  MessageCircle,\n")
    const importLineRegex = new RegExp(`^\\s*${name},?\\s*$`, 'gm');
    if (content.match(importLineRegex)) {
      content = content.replace(importLineRegex, '');
      changed = true;
      console.log(`✅ Removed import: ${name} from ${file}`);
    }
  });

  // Renomear variáveis não usadas para _variableName
  removeVars.forEach(varName => {
    // Padrão: const { varName } = ...  ou  const varName = ...
    const constRegex = new RegExp(`(const\\s+(?:{[^}]*?)?)\\b${varName}\\b`, 'g');
    if (content.match(constRegex)) {
      content = content.replace(constRegex, `$1_${varName}`);
      changed = true;
      console.log(`✅ Renamed variable: ${varName} -> _${varName} in ${file}`);
    }

    // Padrão em função: .map((item, index) => ...)
    const funcArgRegex = new RegExp(`\\(([^,)]*),\\s*${varName}\\)\\s*=>`, 'g');
    if (content.match(funcArgRegex)) {
      content = content.replace(funcArgRegex, `($1, _${varName}) =>`);
      changed = true;
      console.log(`✅ Renamed arg: ${varName} -> _${varName} in ${file}`);
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📝 Updated: ${file}\n`);
  }
});

console.log('\n✨ Done!');
