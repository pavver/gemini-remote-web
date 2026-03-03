<script setup lang="ts">
interface DiffLine {
  type: 'add' | 'del' | 'context' | 'hunk' | 'other';
  oldLine?: number;
  newLine?: number;
  content: string;
}

const props = defineProps<{
  diffContent: string;
  filename?: string;
}>();

function parseDiffWithLineNumbers(diffContent: string): DiffLine[] {
  if (!diffContent) return [];
  
  const lines = diffContent.split('\n');
  const result: DiffLine[] = [];
  let currentOldLine = 0;
  let currentNewLine = 0;
  let inHunk = false;
  const hunkHeaderRegex = /^@@ -(\d+),?\d* \+(\d+),?\d* @@/;

  for (const line of lines) {
    const hunkMatch = line.match(hunkHeaderRegex);
    if (hunkMatch) {
      currentOldLine = parseInt(hunkMatch[1], 10);
      currentNewLine = parseInt(hunkMatch[2], 10);
      inHunk = true;
      result.push({ type: 'hunk', content: line });
      currentOldLine--;
      currentNewLine--;
      continue;
    }
    if (!inHunk) {
      if (line.startsWith('--- ') || line.startsWith('+++ ') || line.startsWith('diff ')) {
        continue;
      }
      continue;
    }
    if (line.startsWith('+')) {
      currentNewLine++;
      result.push({
        type: 'add',
        newLine: currentNewLine,
        content: line.substring(1),
      });
    } else if (line.startsWith('-')) {
      currentOldLine++;
      result.push({
        type: 'del',
        oldLine: currentOldLine,
        content: line.substring(1),
      });
    } else if (line.startsWith(' ')) {
      currentOldLine++;
      currentNewLine++;
      result.push({
        type: 'context',
        oldLine: currentOldLine,
        newLine: currentNewLine,
        content: line.substring(1),
      });
    } else if (line.startsWith('\\')) {
      result.push({ type: 'other', content: line });
    }
  }
  return result;
}

const parsedLines = computed(() => parseDiffWithLineNumbers(props.diffContent));

const displayableLines = computed(() => 
  parsedLines.value.filter(l => l.type !== 'hunk' && l.type !== 'other')
);

const maxLineNumber = computed(() => {
  return Math.max(
    0,
    ...displayableLines.value.map((l) => l.oldLine ?? 0),
    ...displayableLines.value.map((l) => l.newLine ?? 0),
  );
});

const gutterWidth = computed(() => Math.max(1, maxLineNumber.value.toString().length));

function getLineNumber(line: DiffLine) {
  if (line.type === 'add') return line.newLine;
  if (line.type === 'del') return line.oldLine;
  return line.newLine;
}
</script>

<template>
  <div class="font-mono text-[11px] leading-relaxed overflow-x-auto bg-[#121212] rounded-md border border-neutral-800">
    <div v-if="filename" class="px-3 py-1.5 border-b border-neutral-800 bg-neutral-900/50 text-neutral-400 text-[10px] flex items-center gap-2">
      <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />
      {{ filename }}
    </div>
    
    <div class="py-2">
      <template v-for="(line, index) in parsedLines" :key="index">
        <!-- Hunk Header -->
        <div v-if="line.type === 'hunk'" class="px-3 py-1 text-blue-400/60 bg-blue-500/5 select-none text-[10px]">
          {{ line.content }}
        </div>

        <!-- Diff Lines -->
        <div 
          v-else-if="line.type !== 'other'"
          class="group flex items-start"
          :class="{
            'bg-emerald-500/10 text-emerald-400': line.type === 'add',
            'bg-red-500/10 text-red-400': line.type === 'del',
            'hover:bg-neutral-800/50 text-neutral-300': line.type === 'context'
          }"
        >
          <!-- Gutter / Line Numbers -->
          <div 
            class="flex-shrink-0 text-right pr-3 select-none text-neutral-600 border-r border-neutral-800/50"
            :style="{ width: (gutterWidth * 8 + 24) + 'px' }"
          >
            {{ getLineNumber(line) }}
          </div>
          
          <!-- Prefix Symbol -->
          <div class="flex-shrink-0 w-5 text-center select-none font-bold opacity-70">
            {{ line.type === 'add' ? '+' : (line.type === 'del' ? '-' : ' ') }}
          </div>
          
          <!-- Content -->
          <div class="whitespace-pre break-all px-1">
            {{ line.content }}
          </div>
        </div>
      </template>
      
      <div v-if="displayableLines.length === 0" class="px-4 py-8 text-center text-neutral-500 italic">
        No changes detected or binary file.
      </div>
    </div>
  </div>
</template>
