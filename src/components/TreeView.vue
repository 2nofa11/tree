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

const isExpandable = (treeitem: HTMLElement): boolean => {
  return treeitem.hasAttribute('aria-expanded')
}

const isExpanded = (treeitem: HTMLElement): boolean => {
  return treeitem.getAttribute('aria-expanded') === 'true'
}

const collapseTreeitem = (treeitem: HTMLElement) => {
  if (treeitem.hasAttribute('aria-expanded')) {
    treeitem.setAttribute('aria-expanded', 'false')
  }
}

const expandTreeitem = (treeitem: HTMLElement) => {
  if (treeitem.hasAttribute('aria-expanded')) {
    treeitem.setAttribute('aria-expanded', 'true')
  }
}

const expandAllSiblingTreeitems = (treeitem: HTMLElement) => {
  const parentNode = treeitem.parentElement?.parentElement
  if (parentNode) {
    const siblings = parentNode.querySelectorAll(':scope > li > a[aria-expanded]')
    siblings.forEach(sibling => {
      sibling.setAttribute('aria-expanded', 'true')
    })
  }
}

const setFocusToTreeitem = (treeitem: HTMLElement) => {
  const allItems = getAllTreeitems()
  allItems.forEach(item => {
    item.tabIndex = -1
  })
  treeitem.tabIndex = 0
  treeitem.focus()
}

const setFocusToNextTreeitem = (treeitem: HTMLElement) => {
  const visibleItems = getVisibleTreeitems()
  const currentIndex = visibleItems.indexOf(treeitem)
  if (currentIndex >= 0 && currentIndex < visibleItems.length - 1) {
    const nextItem = visibleItems[currentIndex + 1]
    if (nextItem) {
      setFocusToTreeitem(nextItem)
    }
  }
}

const setFocusToPreviousTreeitem = (treeitem: HTMLElement) => {
  const visibleItems = getVisibleTreeitems()
  const currentIndex = visibleItems.indexOf(treeitem)
  if (currentIndex > 0) {
    const prevItem = visibleItems[currentIndex - 1]
    if (prevItem) {
      setFocusToTreeitem(prevItem)
    }
  }
}

const setFocusToParentTreeitem = (treeitem: HTMLElement) => {
  if (isInSubtree(treeitem)) {
    const parent = getParentTreeitem(treeitem)
    if (parent) {
      setFocusToTreeitem(parent)
    }
  }
}

const setFocusByFirstCharacter = (treeitem: HTMLElement, char: string) => {
  const visibleItems = getVisibleTreeitems()
  const currentIndex = visibleItems.indexOf(treeitem)
  const lowerChar = char.toLowerCase()

  let start = currentIndex + 1
  if (start >= visibleItems.length) {
    start = 0
  }

  // Check remaining items
  for (let i = start; i < visibleItems.length; i++) {
    const item = visibleItems[i]
    if (item && item.textContent) {
      const firstChar = item.textContent.trim().charAt(0).toLowerCase()
      if (firstChar === lowerChar) {
        setFocusToTreeitem(item)
        return
      }
    }
  }

  // Check from beginning
  for (let i = 0; i < start; i++) {
    const item = visibleItems[i]
    if (item && item.textContent) {
      const firstChar = item.textContent.trim().charAt(0).toLowerCase()
      if (firstChar === lowerChar) {
        setFocusToTreeitem(item)
        return
      }
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement
  if (target.getAttribute('role') !== 'treeitem') return

  const key = event.key
  let flag = false

  const isPrintableCharacter = (str: string) => {
    return str.length === 1 && str.match(/\S/)
  }

  if (event.altKey || event.ctrlKey || event.metaKey) {
    return
  }

  if (event.shiftKey) {
    if (isPrintableCharacter(key)) {
      if (key === '*') {
        expandAllSiblingTreeitems(target)
        flag = true
      } else {
        setFocusByFirstCharacter(target, key)
        flag = true
      }
    }
  } else {
    switch (key) {
      case ' ':
        handleItemClick(target.getAttribute('href') || '', target.textContent?.trim() || '')
        flag = true
        break

      case 'Up':
      case 'ArrowUp':
        setFocusToPreviousTreeitem(target)
        flag = true
        break

      case 'Down':
      case 'ArrowDown':
        setFocusToNextTreeitem(target)
        flag = true
        break

      case 'Right':
      case 'ArrowRight':
        if (isExpandable(target)) {
          if (isExpanded(target)) {
            setFocusToNextTreeitem(target)
          } else {
            expandTreeitem(target)
          }
        }
        flag = true
        break

      case 'Left':
      case 'ArrowLeft':
        if (isExpandable(target) && isExpanded(target)) {
          collapseTreeitem(target)
          flag = true
        } else {
          if (isInSubtree(target)) {
            setFocusToParentTreeitem(target)
            flag = true
          }
        }
        break

      case 'Home': {
        const allItems = getAllTreeitems()
        const firstItem = allItems[0]
        if (firstItem) {
          setFocusToTreeitem(firstItem)
        }
        flag = true
        break
      }

      case 'End': {
        const visibleItems = getVisibleTreeitems()
        const lastItem = visibleItems[visibleItems.length - 1]
        if (lastItem) {
          setFocusToTreeitem(lastItem)
        }
        flag = true
        break
      }

      default:
        if (isPrintableCharacter(key)) {
          if (key === '*') {
            expandAllSiblingTreeitems(target)
            flag = true
          } else {
            setFocusByFirstCharacter(target, key)
            flag = true
          }
        }
        break
    }
  }

  if (flag) {
    event.stopPropagation()
    event.preventDefault()
  }
}

const handleBodyFocusin = (event: FocusEvent) => {
  const target = event.target as HTMLElement
  isNavFocused.value = treeNode.value?.contains(target) ?? false
}

useEventListener(document.body, 'focusin', handleBodyFocusin)
useEventListener(document.body, 'mousedown', handleBodyFocusin)
useEventListener(treeNode, 'keydown', handleKeydown)
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
