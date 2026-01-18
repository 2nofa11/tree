<script setup lang="ts">
import { ref, reactive } from 'vue'
import TreeView from './components/TreeView.vue'
import type { TreeItem } from './types/tree'

interface ContentData {
  id: string
  label: string
  href: string
}

const treeData: TreeItem[] = [
  {
    id: 'documents',
    label: 'Documents',
    href: '/folders/documents',
    children: [
      {
        id: 'work',
        label: 'Work',
        href: '/folders/documents/work',
        children: [
          {
            id: 'reports',
            label: 'Reports',
            href: '/folders/documents/work/reports'
          },
          {
            id: 'presentations',
            label: 'Presentations',
            href: '/folders/documents/work/presentations'
          }
        ]
      },
      {
        id: 'personal',
        label: 'Personal',
        href: '/folders/documents/personal',
        children: [
          {
            id: 'photos',
            label: 'Photos',
            href: '/folders/documents/personal/photos'
          },
          {
            id: 'receipts',
            label: 'Receipts',
            href: '/folders/documents/personal/receipts'
          }
        ]
      }
    ]
  },
  {
    id: 'downloads',
    label: 'Downloads',
    href: '/folders/downloads',
    children: [
      {
        id: 'software',
        label: 'Software',
        href: '/folders/downloads/software'
      },
      {
        id: 'media',
        label: 'Media',
        href: '/folders/downloads/media'
      }
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/folders/projects',
    children: [
      {
        id: 'web-app',
        label: 'Web App',
        href: '/folders/projects/web-app',
        children: [
          {
            id: 'frontend',
            label: 'Frontend',
            href: '/folders/projects/web-app/frontend'
          },
          {
            id: 'backend',
            label: 'Backend',
            href: '/folders/projects/web-app/backend'
          }
        ]
      },
      {
        id: 'mobile-app',
        label: 'Mobile App',
        href: '/folders/projects/mobile-app'
      }
    ]
  }
]

const selectedId = ref('documents')
const selectedContent = reactive<ContentData>({
  id: 'documents',
  label: 'Documents',
  href: '/folders/documents'
})

const handleItemClick = (href: string, label: string) => {
  // hrefからidを抽出（最後のパス部分）
  const id = href.split('/').pop() || ''
  selectedId.value = id
  selectedContent.id = id
  selectedContent.label = label
  selectedContent.href = href
}
</script>

<template>
  <div class="page">
    <header role="banner">
      <div class="title" id="id_website_title">Folder Explorer</div>
      <div class="tagline">Using a Tree widget pattern for folder selection</div>
    </header>
    <div class="body">
      <TreeView
        :items="treeData"
        :selected-id="selectedId"
        aria-label="Folder Explorer"
        @item-click="handleItemClick"
      />
      <section class="main" aria-labelledby="id_website_title id_page_title">
        <h1 class="page_title" id="id_page_title">{{ selectedContent.label }}</h1>
        <div class="content">
          <p>Selected folder: <strong>{{ selectedContent.label }}</strong></p>
          <p>Path: <code>{{ selectedContent.href }}</code></p>
          <p>ID: <code>{{ selectedContent.id }}</code></p>
        </div>
      </section>
    </div>
    <footer role="contentinfo">Folder Explorer - Tree View Demo</footer>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}

.page {
  text-align: left;
}

.page header {
  border: #005a9c solid 2px;
  background: #005a9c;
  color: white;
  text-align: center;
}

.page header .title {
  font-size: 2.5em;
  font-weight: bold;
  font-family: serif;
}

.page header .tagline {
  font-style: italic;
}

.page footer {
  border: #005a9c solid 2px;
  background: #005a9c;
  font-family: serif;
  color: white;
  font-style: italic;
  padding-left: 1em;
}

.page .body {
  display: grid;
  grid-template-columns: auto 1fr;
  border: #eee solid 2px;
}

.page .main {
  padding: 1em;
}

.page .main h1 {
  margin: 0;
  padding: 0;
}

.page .main a {
  color: #005a9c;
}

.page .main a:hover {
  text-decoration: underline;
}
</style>
