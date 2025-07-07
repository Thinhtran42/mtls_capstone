// src/utils/magenta-wrapper.js

// Kiểm tra xem Magenta.js đã được tải chưa
const waitForMagenta = () => {
    return new Promise((resolve, reject) => {
        if (window.mm) {
            resolve(window.mm)
            return
        }

        // Đợi tối đa 5 giây
        let attempts = 0
        const maxAttempts = 50
        const interval = 100 // 100ms

        const checkMagenta = () => {
            attempts++
            if (window.mm) {
                resolve(window.mm)
                return
            }

            if (attempts >= maxAttempts) {
                reject(new Error('Magenta.js not loaded after 5 seconds'))
                return
            }

            setTimeout(checkMagenta, interval)
        }

        checkMagenta()
    })
}

// Các hàm wrapper
export const initializeMusicVAE = async(modelUrl) => {
    try {
        const mm = await waitForMagenta()
        const model = new mm.MusicVAE(modelUrl)
        await model.initialize()
        return model
    } catch (error) {
        console.error('Error initializing MusicVAE:', error)
        throw error
    }
}

export const createPlayer = async() => {
    try {
        const mm = await waitForMagenta()
        return new mm.Player()
    } catch (error) {
        console.error('Error creating Player:', error)
        throw error
    }
}

export const pitchToName = async(pitch) => {
    try {
        const mm = await waitForMagenta()
        return mm.NoteSequence.pitchToName(pitch)
    } catch (error) {
        console.error('Error converting pitch to name:', error)
        throw error
    }
}

export const nameToMidi = async(name) => {
    try {
        const mm = await waitForMagenta()
        return mm.NoteSequence.nameToMidi(name)
    } catch (error) {
        console.error('Error converting name to MIDI:', error)
        throw error
    }
}

// Thêm các hàm wrapper khác nếu cần