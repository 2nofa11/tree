import { render, type RenderResult } from '@testing-library/vue'
import { userEvent } from '@testing-library/user-event'
import TreeView from '../../TreeView.vue'
import type { TreeItem } from '../../../types/tree'

/**
 * TreeViewコンポーネントをレンダリングするヘルパー
 */
export function renderTreeView(
  items: TreeItem[],
  options: {
    selectedId?: string
    ariaLabel?: string
  } = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const user = userEvent.setup()
  const result = render(TreeView, {
    props: {
      items,
      selectedId: options.selectedId || '',
      ariaLabel: options.ariaLabel || 'Navigation',
    },
  })

  return { ...result, user }
}

/**
 * テキストからtreeitem要素を取得
 */
export function getTreeitemByText(getByText: (text: string | RegExp) => HTMLElement, text: string): HTMLElement {
  const element = getByText(text)
  const treeitem = element.closest('[role="treeitem"]')
  if (!treeitem) {
    throw new Error(`Could not find treeitem for text: ${text}`)
  }
  return treeitem as HTMLElement
}
