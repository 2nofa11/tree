import type { TreeItem } from '../../../types/tree'

/**
 * 基本的な階層構造のテストデータ
 * - 3つのトップレベル項目
 * - 2階層の子要素
 */
export const basicTreeData: TreeItem[] = [
  {
    id: 'fruits',
    label: 'Fruits',
    href: '/fruits',
    children: [
      {
        id: 'apple',
        label: 'Apple',
        href: '/fruits/apple',
      },
      {
        id: 'banana',
        label: 'Banana',
        href: '/fruits/banana',
        children: [
          {
            id: 'cavendish',
            label: 'Cavendish',
            href: '/fruits/banana/cavendish',
          },
        ],
      },
    ],
  },
  {
    id: 'vegetables',
    label: 'Vegetables',
    href: '/vegetables',
    children: [
      {
        id: 'carrot',
        label: 'Carrot',
        href: '/vegetables/carrot',
      },
      {
        id: 'potato',
        label: 'Potato',
        href: '/vegetables/potato',
      },
    ],
  },
  {
    id: 'grains',
    label: 'Grains',
    href: '/grains',
  },
]

/**
 * 文字検索テスト用のデータ
 * - 同じ文字で始まる項目を複数含む（B, C）
 */
export const searchTestData: TreeItem[] = [
  {
    id: 'apple',
    label: 'Apple',
    href: '/apple',
  },
  {
    id: 'banana',
    label: 'Banana',
    href: '/banana',
  },
  {
    id: 'blueberry',
    label: 'Blueberry',
    href: '/blueberry',
  },
  {
    id: 'cherry',
    label: 'Cherry',
    href: '/cherry',
  },
  {
    id: 'coconut',
    label: 'Coconut',
    href: '/coconut',
  },
  {
    id: 'cranberry',
    label: 'Cranberry',
    href: '/cranberry',
  },
]

/**
 * 兄弟展開テスト用のデータ
 * - 展開可能な兄弟要素を複数含む
 */
export const siblingExpandTestData: TreeItem[] = [
  {
    id: 'category1',
    label: 'Category 1',
    href: '/category1',
    children: [
      {
        id: 'item1-1',
        label: 'Item 1-1',
        href: '/category1/item1-1',
      },
      {
        id: 'item1-2',
        label: 'Item 1-2',
        href: '/category1/item1-2',
      },
    ],
  },
  {
    id: 'category2',
    label: 'Category 2',
    href: '/category2',
    children: [
      {
        id: 'item2-1',
        label: 'Item 2-1',
        href: '/category2/item2-1',
      },
      {
        id: 'item2-2',
        label: 'Item 2-2',
        href: '/category2/item2-2',
      },
    ],
  },
  {
    id: 'category3',
    label: 'Category 3',
    href: '/category3',
    children: [
      {
        id: 'item3-1',
        label: 'Item 3-1',
        href: '/category3/item3-1',
      },
    ],
  },
]
