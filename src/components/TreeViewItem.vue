<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeItem } from '../types/tree'

interface Props {
  item: TreeItem
  level: number
  isFirst?: boolean
  selectedId: string
}

const props = withDefaults(defineProps<Props>(), {
  isFirst: false
})

const emit = defineEmits<{
  'item-click': [url: string, label: string]
}>()

const linkRef = ref<HTMLElement | null>(null)

const tabIndex = computed(() => {
  return props.isFirst ? 0 : -1
})

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const isSelected = computed(() => {
  return props.selectedId === props.item.id
})

const labelPaddingLeft = computed(() => {
  return props.level > 0 ? `${props.level}em` : '0'
})

const handleClick = (event: Event) => {
  event.preventDefault()
  emit('item-click', props.item.href, props.item.label)
}

const handleIconClick = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()

  if (linkRef.value && hasChildren.value) {
    const currentExpanded = linkRef.value.getAttribute('aria-expanded') === 'true'
    linkRef.value.setAttribute('aria-expanded', String(!currentExpanded))
  }
}

const handleItemClickFromChild = (url: string, label: string) => {
  emit('item-click', url, label)
}
</script>

<template>
  <li role="none">
    <a
      ref="linkRef"
      role="treeitem"
      :href="item.href"
      :aria-expanded="hasChildren ? false : undefined"
      :aria-owns="hasChildren ? `${item.id}-subtree` : undefined"
      :aria-selected="isSelected"
      :tabindex="tabIndex"
      @click="handleClick"
    >
      <span class="label">
        <span v-if="hasChildren" class="icon" @click="handleIconClick">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10">
            <polygon points="2 1, 12 1, 7 9"></polygon>
          </svg>
        </span>
        {{ item.label }}
      </span>
    </a>
    <ul
      v-if="hasChildren"
      :id="`${item.id}-subtree`"
      role="group"
      :aria-label="item.label"
    >
      <TreeViewItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :level="level + 1"
        :selected-id="selectedId"
        @item-click="handleItemClickFromChild"
      />
    </ul>
  </li>
</template>

<style scoped>
li {
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: left;
}

ul {
  margin: 0;
  padding: 0;
}

a[role='treeitem'] {
  margin: 0;
  padding: 4px;
  padding-left: 9px;
  text-decoration: none;
  color: #005a9c;
  border: none;
  display: block;
  text-align: left;
}

a[role='treeitem'][aria-selected='true'] {
  border-left: 5px solid #005a9c;
  padding-left: 4px;
  background-color: #ddd;
}

a[role='treeitem']:focus {
  outline: 0;
  padding: 2px;
  padding-left: 7px;
  border: 2px #005a9c solid;
}

a[role='treeitem'][aria-selected='true']:focus {
  padding-left: 4px;
  border-left-width: 5px;
}

a[role='treeitem']:hover {
  background-color: #adddff;
  text-decoration: underline;
  padding-left: 4px;
  border-left: 5px solid #333;
}

/* 展開/折りたたみの表示制御 */
a[role='treeitem'][aria-expanded='false'] + [role='group'] {
  display: none;
}

a[role='treeitem'][aria-expanded='true'] + [role='group'] {
  display: block;
}

/* SVGアイコン */
a[role='treeitem'] > span svg {
  transform: translate(0, 0);
}

a[role='treeitem'][aria-expanded='false'] > span svg {
  transform: rotate(270deg) translate(2px, 2px);
}

span.label {
  text-align: left;
  padding-left: v-bind(labelPaddingLeft);
}

span.icon svg polygon {
  stroke-width: 2px;
  fill: currentcolor;
  stroke: transparent;
}

span.icon:hover {
  color: #333;
}

span.icon svg polygon:hover {
  stroke: currentcolor;
}
</style>