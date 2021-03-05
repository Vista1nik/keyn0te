const pdf2png = require('./pdf2png')

const thumbnail = {
    create: async (keynotePath) => {
        let imageBuffer = await pdf2png(keynotePath, 1)

        return imageBuffer.toString('base64')
    }
}

module.exports = thumbnail