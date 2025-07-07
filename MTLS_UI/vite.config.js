import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            include: ['global', 'process', 'buffer', 'util', 'stream'],
            globals: {
                process: true,
                global: true,
                Buffer: true,
            },
            overrides: {
                process: {
                    hrtime: (previousTimestamp) => {
                        const clocktime = performance.now() * 1e-3
                        let seconds = Math.floor(clocktime)
                        let nanoseconds = Math.floor((clocktime % 1) * 1e9)

                        if (previousTimestamp) {
                            seconds = seconds - previousTimestamp[0]
                            nanoseconds = nanoseconds - previousTimestamp[1]

                            if (nanoseconds < 0) {
                                seconds--
                                nanoseconds += 1e9
                            }
                        }
                        return [seconds, nanoseconds]
                    },
                },
            },
        }),
    ],
    // Thêm cấu hình server để hỗ trợ SPA routing
    server: {
        port: 3001,
        // Cấu hình để tất cả các routes không tìm thấy trả về index.html
        historyApiFallback: true,
        // Cấu hình proxy để gọi API từ localhost:3000 khi test local
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:3000',
        //         changeOrigin: true,
        //         rewrite: (path) => path.replace(/^\/api/, '')
        //     }
        // }
    },
    preview: {
        port: 3002,
        // Cấu hình tương tự cho chế độ preview
        historyApiFallback: true,
    }
})