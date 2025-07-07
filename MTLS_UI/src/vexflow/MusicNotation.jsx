/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'
import { Vex } from 'vexflow'

const MusicNotation = ({ notes, onNoteClick }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      // Xóa nội dung cũ
      containerRef.current.innerHTML = ''

      // Tạo một VexFlow Renderer
      const { Renderer, Stave, StaveNote, Formatter } = Vex.Flow

      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG)
      const context = renderer.getContext()
      const stave = new Stave(10, 0, 500)

      try {
        // Thêm các nốt nhạc
        const staveNotes = notes.map((note) => {
          return new StaveNote({
            keys: [note],
            duration: 'q', // Quarter note
          })
        })

        // Thêm stave và nốt nhạc vào context
        stave.addClef('treble').addTimeSignature('4/4')
        stave.setContext(context).draw()

        Formatter.FormatAndDraw(context, stave, staveNotes)

        // Thêm sự kiện click cho các nốt nhạc
        const svgElement = containerRef.current.querySelector('svg')
        if (svgElement) {
          svgElement.addEventListener('click', (event) => {
            const target = event.target
            if (target.classList.contains('vf-note')) {
              const note = target.getAttribute('data-note')
              onNoteClick(note)
            }
          })
        }
      } catch (error) {
        console.error('Lỗi khi tạo nốt nhạc:', error)
        // Hiển thị thông báo lỗi
        containerRef.current.innerHTML = `<p style="color: red;">Lỗi khi hiển thị nốt nhạc: ${error.message}</p>`
      }
    }
  }, [notes, onNoteClick])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '150px' }}
    ></div>
  )
}

export default MusicNotation
