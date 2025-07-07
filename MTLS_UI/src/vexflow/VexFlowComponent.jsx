/* eslint-disable react/prop-types */
import { Box, TextField, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow'

// Hàm tải file JSON từ đường dẫn
// eslint-disable-next-line no-unused-vars
const loadJson = async (path) => {
  try {
    console.log('Fetching VexFlow JSON from:', path)
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading JSON:', error)
    return null
  }
}

// Hàm phân tích chuỗi nốt nhạc VexFlow
// eslint-disable-next-line no-unused-vars
const parseVexFlowNotes = (notesString) => {
  if (!notesString) return []

  // Tách chuỗi thành các nốt riêng biệt
  const parts = notesString.split(/,\s*/)
  return parts.map((part) => {
    // Phân tích từng phần
    const match = part.match(/([A-G][#b]?\/\d)/)
    return match ? match[1] : null
  }).filter(Boolean)
}

export function VexFlowComponent({
  jsonPath,
  notes,
  width = 600,
  height = 200,
  onAnswer,
  showResults,
  correctAnswer,
  editable = false,
  onNotationChange,
  multipleChoiceOptions = [],
  onMultipleChoiceAnswer,
  selectedOption = null,
}) {
  const canvasRef = useRef(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [editableNotation, setEditableNotation] = useState(notes || '')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Khi notes được cập nhật từ bên ngoài, đồng bộ với state nội bộ
    if (!editable) {
      setEditableNotation(notes || '')
    }
  }, [notes, editable])

  useEffect(() => {
    const renderVexFlow = async () => {
      if (!canvasRef.current) {
        console.log('Canvas missing')
        return
      }

      // Xóa thông báo lỗi
      setErrorMessage('')
      
      // Xóa nội dung cũ trước khi vẽ lại
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Khởi tạo renderer VexFlow với kích thước lớn hơn
      const renderer = new Renderer(canvasRef.current, Renderer.Backends.CANVAS)
      
      // Đảm bảo kích thước đủ lớn
      const actualWidth = Math.max(width, 400);
      const actualHeight = Math.max(height, 200);
      
      renderer.resize(actualWidth, actualHeight)
      const vexContext = renderer.getContext()
      
      // Giảm scale để hiển thị đầy đủ khuông nhạc
      vexContext.scale(1.3, 1.3)

      // Tạo khuông nhạc (stave) - đặt ở giữa canvas với chiều dài đủ
      const staveX = 20;
      const staveY = 40;
      const staveWidth = actualWidth - 80;
      
      const stave = new Stave(staveX, staveY, staveWidth)
      stave.addClef('treble')
      stave.setContext(vexContext).draw()

      try {
        let notesToRender = [];
        
        // Sử dụng editableNotation khi ở chế độ editable, nếu không thì dùng notes từ props
        const currentNotation = editable ? editableNotation : notes;
        
        if (currentNotation) {
          console.log("Rendering notes:", currentNotation);
          
          // Xử lý nốt đơn - định dạng c/4/w
          if (currentNotation.includes('/')) {
            // Kiểm tra xem có phải là hợp âm không
            if (currentNotation.includes('(')) {
              // Xử lý hợp âm - định dạng (c/4,e/4,g/4)/w
              const chordMatch = currentNotation.match(/\((.*?)\)\/(\w+)/)
              if (chordMatch) {
                const noteNames = chordMatch[1].split(',').map(n => n.trim())
                const duration = chordMatch[2]
                
                // Đảm bảo các nốt trong hợp âm có định dạng đúng
                const formattedNoteNames = noteNames.map(noteName => {
                  return noteName.trim();
                });
                
                console.log("Formatted chord notes:", formattedNoteNames);
                
                // Tạo nốt nhạc với đúng loại (whole, half, quarter)
                const staveNote = new StaveNote({ 
                  keys: formattedNoteNames, 
                  duration: duration 
                });
                
                notesToRender.push(staveNote);
              }
            } else {
              // Xử lý nốt đơn - định dạng c/4/w
              const parts = currentNotation.split('/');
              
              if (parts.length >= 2) {
                const noteName = parts[0] + '/' + parts[1]; // c/4
                const duration = parts.length >= 3 ? parts[2] : 'w'; // w
                
                console.log("Formatted note name:", noteName, "duration:", duration);
                
                // Tạo nốt nhạc với đúng loại (whole, half, quarter)
                const staveNote = new StaveNote({ 
                  keys: [noteName], 
                  duration: duration 
                });
                
                notesToRender.push(staveNote);
              }
            }
          } else {
            console.warn("Invalid notation format:", currentNotation);
          }
        }
        
        // Nếu không thể phân tích notation hoặc không có notes, sử dụng nốt mặc định
        if (notesToRender.length === 0) {
          console.warn("Could not parse notation, using default note:", currentNotation);
          // Hiển thị nốt C4 mặc định (nốt trắng)
          notesToRender = [
            new StaveNote({ keys: ['c/4'], duration: 'w' })
          ]
        }
        
        // Cài đặt voice với số lượng beat phù hợp
        // Sử dụng số beat dựa trên loại nốt (w=4, h=2, q=1)
        const duration = notesToRender[0]?.duration || 'w'
        let numBeats = 4  // Mặc định
        
        if (duration === 'w') numBeats = 4
        else if (duration === 'h') numBeats = 2
        else if (duration === 'q') numBeats = 1
        
        const voice = new Voice({ num_beats: numBeats, beat_value: 4 })
        voice.addTickables(notesToRender)
        
        const formatter = new Formatter()
        formatter.joinVoices([voice]).format([voice], staveWidth - 50)
        
        // Đặt nốt nhạc ở giữa khuông nhạc
        voice.draw(vexContext, stave)
      } catch (error) {
        console.error('Error rendering notes:', error, 'Notes:', editable ? editableNotation : notes)
        
        // Hiển thị thông báo lỗi nếu đang ở chế độ editable
        if (editable) {
          setErrorMessage('Syntax error: Invalid format. Please check again.')
        }

        // Vẽ nốt mặc định nếu có lỗi (nốt trắng)
        const defaultNotes = [
          new StaveNote({ keys: ['c/4'], duration: 'w' }),
        ]

        const voice = new Voice({ num_beats: 4, beat_value: 4 })
        voice.addTickables(defaultNotes)

        const formatter = new Formatter()
        formatter.joinVoices([voice]).format([voice], staveWidth - 50)

        voice.draw(vexContext, stave)
      }
    }

    renderVexFlow()
    // Reset state khi jsonPath hoặc notes thay đổi
    if (!editable) {
      setUserAnswer('')
    }
  }, [jsonPath, notes, width, height, editableNotation, editable])

  // Khi người dùng nhập đáp án, gửi đáp án cho component cha
  const handleInputChange = (e) => {
    const value = e.target.value
    setUserAnswer(value)
    if (onAnswer) onAnswer(value) // Gửi đáp án cho component cha nếu có
  }
  
  // Xử lý khi người dùng thay đổi chuỗi notation
  const handleNotationChange = (e) => {
    const value = e.target.value
    setEditableNotation(value)
    
    // Báo cho component cha biết về sự thay đổi nếu có
    if (onNotationChange) {
      onNotationChange(value)
    }
  }

  // Xử lý khi người dùng chọn đáp án trắc nghiệm
  const handleMultipleChoiceSelect = (option) => {
    if (onMultipleChoiceAnswer) {
      onMultipleChoiceAnswer(option);
    }
  };

  return (
    <Box
      sx={{
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {editable && (
        <TextField
          fullWidth
          label='Notation VexFlow String'  
          value={editableNotation}
          onChange={handleNotationChange}
          margin="normal"
          placeholder='Example: c/4/q, e/4/h, g/4/w'
          helperText={errorMessage}
          error={!!errorMessage}
          sx={{ mb: 2 }}
        />
      )}
      
      <Box
        sx={{
          width: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          marginBottom: '16px',
          minHeight: '180px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      {multipleChoiceOptions.length > 0 ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <RadioGroup 
            value={selectedOption || ''} 
            onChange={(e) => handleMultipleChoiceSelect(e.target.value)}
          >
            {multipleChoiceOptions.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
                disabled={showResults}
              />
            ))}
          </RadioGroup>
          
          {showResults && correctAnswer && (
            <Box sx={{ mt: 2, width: '100%', textAlign: 'left' }}>
              <Typography
                variant='subtitle1'
                fontWeight='bold'
                color={selectedOption === correctAnswer ? 'success.main' : 'error.main'}
              >
                Đáp án đúng: {correctAnswer}
              </Typography>
              <Typography
                variant='body2'
                color={selectedOption === correctAnswer ? 'success.main' : 'error.main'}
              >
                {selectedOption === correctAnswer ? 'Chính xác!' : 'Chưa chính xác!'}
              </Typography>
            </Box>
          )}
        </Box>
      ) : onAnswer && (
        <Box sx={{ width: '100%' }}>
          <TextField
            label='Nhập đáp án của bạn'
            variant='outlined'
            value={userAnswer}
            onChange={handleInputChange}
            disabled={showResults}
            fullWidth
            placeholder='Ví dụ: G, B, D, F'
            helperText='Nhập tên các nốt nhạc, cách nhau bằng dấu phẩy'
          />
          
          {showResults && correctAnswer && (
            <Box sx={{ mt: 2, width: '100%', textAlign: 'left' }}>
              <Typography
                variant='subtitle1'
                fontWeight='bold'
                color={userAnswer === correctAnswer ? 'success.main' : 'error.main'}
              >
                Đáp án đúng: {correctAnswer}
              </Typography>
              <Typography
                variant='body2'
                color={userAnswer === correctAnswer ? 'success.main' : 'error.main'}
              >
                {userAnswer === correctAnswer ? 'Chính xác!' : 'Chưa chính xác!'}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default VexFlowComponent
