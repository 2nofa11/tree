import { describe, it, expect } from 'vitest'
import { render, within } from '@testing-library/vue'
import { userEvent } from '@testing-library/user-event'
import TreeViewItem from '../TreeViewItem.vue'
import type { TreeItem } from '../../types/tree'

describe('TreeViewItem', () => {
  const simpleItem: TreeItem = {
    id: 'test',
    label: 'Test Item',
    href: '/test',
  }

  const itemWithChildren: TreeItem = {
    id: 'parent',
    label: 'Parent Item',
    href: '/parent',
    children: [
      {
        id: 'child1',
        label: 'Child 1',
        href: '/parent/child1',
      },
      {
        id: 'child2',
        label: 'Child 2',
        href: '/parent/child2',
      },
    ],
  }

  describe('Props', () => {
    it('labelをレンダリングする', () => {
      const { getByText } = render(TreeViewItem, {
        props: {
          item: simpleItem,
          level: 0,
          selectedId: '',
        },
      })

      expect(getByText('Test Item')).toBeInTheDocument()
    })

    it.each([
      { isFirst: true, expected: '0' },
      { isFirst: false, expected: '-1' },
    ])('isFirst=$isFirstの場合、tabindex=$expectedを設定する', ({ isFirst, expected }) => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item: simpleItem,
          level: 0,
          selectedId: '',
          isFirst,
        },
      })

      const treeitem = getByRole('treeitem')
      expect(treeitem).toHaveAttribute('tabindex', expected)
    })

    it.each([0, 1, 2])('level=%iの場合、label要素が存在する', (level) => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item: simpleItem,
          level,
          selectedId: '',
        },
      })

      const treeitem = getByRole('treeitem')
      const labelSpan = treeitem.querySelector('.label') as HTMLElement
      expect(labelSpan).toBeInTheDocument()
    })

    it.each([
      { selectedId: 'test', expected: 'true', description: '一致する' },
      { selectedId: 'other', expected: 'false', description: '一致しない' },
    ])('selectedIdと$descriptionの場合、aria-selected="$expected"', ({ selectedId, expected }) => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item: simpleItem,
          level: 0,
          selectedId,
        },
      })

      const treeitem = getByRole('treeitem')
      expect(treeitem).toHaveAttribute('aria-selected', expected)
    })
  })

  describe('Children Rendering', () => {
    it('子要素がある場合、子要素とaria属性を設定する', () => {
      const { getByText, getByRole } = render(TreeViewItem, {
        props: {
          item: itemWithChildren,
          level: 0,
          selectedId: '',
        },
      })

      expect(getByText('Child 1')).toBeInTheDocument()
      expect(getByText('Child 2')).toBeInTheDocument()

      const treeitem = getByRole('treeitem', { name: /Parent Item/ })
      expect(treeitem).toHaveAttribute('aria-expanded', 'false')
      expect(treeitem).toHaveAttribute('aria-owns', 'parent-subtree')
    })

    it.each([
      { attribute: 'aria-expanded' },
      { attribute: 'aria-owns' },
    ])('子要素がない場合、$attribute属性がない', ({ attribute }) => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item: simpleItem,
          level: 0,
          selectedId: '',
        },
      })

      const treeitem = getByRole('treeitem')
      expect(treeitem).not.toHaveAttribute(attribute)
    })

    it('子要素のレベルが親より1大きい', async () => {
      const { container } = render(TreeViewItem, {
        props: {
          item: itemWithChildren,
          level: 1,
          selectedId: '',
        },
      })

      const group = container.querySelector('[role="group"]')
      expect(group).toBeInTheDocument()

      const childTreeitems = within(group as HTMLElement).getAllByRole('treeitem')
      expect(childTreeitems.length).toBe(2)
    })

    it('初期状態で子要素が折りたたまれている', () => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item: itemWithChildren,
          level: 0,
          selectedId: '',
        },
      })

      // aria-expanded=falseを確認することで、折りたたまれていることを確認
      const treeitem = getByRole('treeitem', { name: /Parent Item/ })
      expect(treeitem).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Icon Click', () => {
    it('アイコンクリックで展開/折りたたみが切り替わり、item-clickイベントは発火しない', async () => {
      const user = userEvent.setup()
      const { getByRole, container, emitted } = render(TreeViewItem, {
        props: {
          item: itemWithChildren,
          level: 0,
          selectedId: '',
        },
      })

      const treeitem = getByRole('treeitem', { name: /Parent Item/ })
      const icon = container.querySelector('.icon') as HTMLElement

      // 1回目のクリックで展開
      await user.click(icon)
      expect(treeitem).toHaveAttribute('aria-expanded', 'true')
      expect(emitted()['item-click']).toBeUndefined()

      // 2回目のクリックで折りたたみ
      await user.click(icon)
      expect(treeitem).toHaveAttribute('aria-expanded', 'false')
      expect(emitted()['item-click']).toBeUndefined()
    })
  })

  describe('Item Click', () => {
    it.each([
      {
        description: '通常のアイテム',
        item: simpleItem,
        selector: undefined,
        expectedHref: '/test',
        expectedLabel: 'Test Item',
      },
      {
        description: '親アイテム',
        item: itemWithChildren,
        selector: { name: /Parent Item/ },
        expectedHref: '/parent',
        expectedLabel: 'Parent Item',
      },
    ])('$descriptionをクリックするとitem-clickイベントが発火する', async ({ item, selector, expectedHref, expectedLabel }) => {
      const user = userEvent.setup()
      const { getByRole, emitted } = render(TreeViewItem, {
        props: {
          item,
          level: 0,
          selectedId: '',
        },
      })

      const treeitem = selector ? getByRole('treeitem', selector) : getByRole('treeitem')
      await user.click(treeitem)

      expect(emitted()['item-click']).toBeTruthy()
      expect(emitted()['item-click']![0]).toEqual([expectedHref, expectedLabel])
    })

    it('子要素のitem-clickイベントが親に伝播する', async () => {
      const user = userEvent.setup()
      const { getByRole, emitted } = render(TreeViewItem, {
        props: {
          item: itemWithChildren,
          level: 0,
          selectedId: '',
        },
      })

      // 先に展開する
      const icon = (getByRole('treeitem', { name: /Parent Item/ })
        .parentElement as HTMLElement).querySelector('.icon') as HTMLElement
      await user.click(icon)

      // 子要素をクリック
      const childTreeitem = getByRole('treeitem', { name: 'Child 1' })
      await user.click(childTreeitem)

      expect(emitted()['item-click']).toBeTruthy()
      expect(emitted()['item-click']![0]).toEqual(['/parent/child1', 'Child 1'])
    })
  })

  describe('Computed Properties Coverage', () => {
    it.each([0, 1, 2, 3])('labelPaddingLeft: level=%iでlabel要素が存在する', (level) => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item: simpleItem,
          level,
          selectedId: '',
        },
      })

      const treeitem = getByRole('treeitem')
      const labelSpan = treeitem.querySelector('.label') as HTMLElement
      expect(labelSpan).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('子要素がない場合、アイコンは表示されない', () => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item: simpleItem,
          level: 0,
          selectedId: '',
        },
      })

      const treeitem = getByRole('treeitem')
      const icon = treeitem.querySelector('.icon')
      expect(icon).not.toBeInTheDocument()
    })
  })

  describe('Branch Coverage for Computed Properties', () => {
    it.each([
      {
        description: 'childrenがundefined',
        item: { id: 'no-children', label: 'No Children', href: '/no-children' },
        hasExpanded: false,
        selector: undefined,
      },
      {
        description: 'childrenが空配列',
        item: { id: 'empty-children', label: 'Empty Children', href: '/empty-children', children: [] },
        hasExpanded: false,
        selector: undefined,
      },
      {
        description: 'childrenがある',
        item: itemWithChildren,
        hasExpanded: true,
        selector: { name: /Parent Item/ },
      },
    ])('hasChildren: $descriptionの場合', ({ item, hasExpanded, selector }) => {
      const { getByRole } = render(TreeViewItem, {
        props: {
          item,
          level: 0,
          selectedId: '',
        },
      })

      const treeitem = selector ? getByRole('treeitem', selector) : getByRole('treeitem')
      if (hasExpanded) {
        expect(treeitem).toHaveAttribute('aria-expanded')
      } else {
        expect(treeitem).not.toHaveAttribute('aria-expanded')
      }
    })
  })
})
