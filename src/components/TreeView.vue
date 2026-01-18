<script setup lang="ts">
import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import TreeViewItem from './TreeViewItem.vue'
import type { TreeItem } from '../types/tree'

interface Props {
  items: TreeItem[]
  selectedId: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  ariaLabel: ''
})

const emit = defineEmits<{
  'item-click': [url: string, label: string]
}>()

const treeNode = ref<HTMLElement | null>(null)
const isNavFocused = ref(false)

const handleItemClick = (url: string, label: string) => {
  emit('item-click', url, label)
}

// キーボードナビゲーション関連の関数
const getAllTreeitems = (): HTMLElement[] => {
  if (!treeNode.value) return []
  return Array.from(treeNode.value.querySelectorAll('[role="treeitem"]'))
}

const getVisibleTreeitems = (): HTMLElement[] => {
  const allItems = getAllTreeitems()
  return allItems.filter(item => isVisible(item))
}

const isVisible = (treeitem: HTMLElement): boolean => {
  let current = treeitem
  while (isInSubtree(current)) {
    const parent = getParentTreeitem(current)
    if (!parent || parent.getAttribute('aria-expanded') === 'false') {
      return false
    }
    current = parent
  }
  return true
}

const isInSubtree = (treeitem: HTMLElement): boolean => {
  if (treeitem.parentElement && treeitem.parentElement.parentElement) {
    return treeitem.parentElement.parentElement.getAttribute('role') === 'group'
  }
  return false
}

const getParentTreeitem = (treeitem: HTMLElement): HTMLElement | null => {
  let node = treeitem.parentElement
  if (node) {
    node = node.parentElement
    if (node) {
      const prev = node.previousElementSibling
      if (prev && prev.getAttribute('role') === 'treeitem') {
        return prev as HTMLElement
      }
    }
  }
  return null
}

const handleBodyFocusin = (event: FocusEvent) => {
  const target = event.target as HTMLElement
  isNavFocused.value = treeNode.value?.contains(target) ?? false
}

useEventListener(document.body, 'focusin', handleBodyFocusin)
useEventListener(document.body, 'mousedown', handleBodyFocusin)
</script>

<template>
  <nav ref="navNode" :class="{ focus: isNavFocused }" :aria-label="ariaLabel">
    <ul ref="treeNode" class="treeview-navigation" role="tree" :aria-label="ariaLabel">
      <TreeViewItem
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :level="0"
        :is-first="index === 0"
        :selected-id="selectedId"
        @item-click="handleItemClick"
      />
    </ul>
  </nav>
</template>

<style scoped>
nav {
  margin: 0;
  padding: 6px;
  width: 17em;
  height: 60em;
  background: #eee;
  text-align: left;
}

nav.focus {
  padding: 4px;
  border: 2px solid #005a9c;
}

.treeview-navigation[role='tree'] {
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: left;
}
</style>
