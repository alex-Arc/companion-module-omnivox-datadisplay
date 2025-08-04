import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

export default generateEslintConfig({
	enableTypescript: true,
	ignores: ['./page/vite.config.ts', './page/vite-env.d.ts'],
})
