import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',  // 一定要包含你的所有组件目录
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}

export default config
