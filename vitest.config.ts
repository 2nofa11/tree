import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      // フォーカス管理テストの安定性のため順次実行
      pool: 'forks',
      singleFork: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'json'],
        include: ['src/components/TreeView.vue', 'src/components/TreeViewItem.vue'],
        exclude: ['**/*.spec.ts', '**/__tests__/**', '**/test/**'],
        all: true,
        thresholds: {
          lines: 95,
          functions: 95,
          branches: 80,
          statements: 95,
        },
      },
    },
  })
)
