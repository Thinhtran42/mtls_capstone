/**
 * Xác định nốt nhạc dựa trên tần số được phát hiện
 * @param {number} frequency - Tần số được phát hiện (Hz)
 * @returns {string|null} - ID của nốt nhạc hoặc null nếu không nhận diện được
 */
export const detectNoteFromFrequency = (frequency) => {
    if (!frequency || frequency < 100) return null;
    
    const notes = [
      { id: 'C3', name: 'Đô', minFreq: 123, maxFreq: 138, notation: 'C/3' },
      { id: 'D3', name: 'Rê', minFreq: 138, maxFreq: 155, notation: 'D/3' },
      { id: 'E3', name: 'Mi', minFreq: 155, maxFreq: 170, notation: 'E/3' },
      { id: 'F3', name: 'Fa', minFreq: 170, maxFreq: 185, notation: 'F/3' },
      { id: 'G3', name: 'Sol', minFreq: 185, maxFreq: 208, notation: 'G/3' },
      { id: 'A3', name: 'La', minFreq: 208, maxFreq: 233, notation: 'A/3' },
      { id: 'B3', name: 'Si', minFreq: 233, maxFreq: 261, notation: 'B/3' },
      // Có thể thêm các nốt ở octave khác nếu cần
    ];
  
    const matchedNote = notes.find(note => 
      frequency >= note.minFreq && frequency < note.maxFreq
    );
    
    return matchedNote ? matchedNote.id : null;
  };
  
  /**
   * Lấy thông tin chi tiết của nốt từ ID
   * @param {string} noteId - ID của nốt (ví dụ: "C3")
   * @returns {Object|null} - Thông tin chi tiết của nốt hoặc null
   */
  export const getNoteDetails = (noteId) => {
    if (!noteId) return null;
    
    const notes = [
      { id: 'C3', name: 'Đô', minFreq: 123, maxFreq: 138, notation: 'C/3' },
      { id: 'D3', name: 'Rê', minFreq: 138, maxFreq: 155, notation: 'D/3' },
      { id: 'E3', name: 'Mi', minFreq: 155, maxFreq: 170, notation: 'E/3' },
      { id: 'F3', name: 'Fa', minFreq: 170, maxFreq: 185, notation: 'F/3' },
      { id: 'G3', name: 'Sol', minFreq: 185, maxFreq: 208, notation: 'G/3' },
      { id: 'A3', name: 'La', minFreq: 208, maxFreq: 233, notation: 'A/3' },
      { id: 'B3', name: 'Si', minFreq: 233, maxFreq: 261, notation: 'B/3' },
    ];
    
    return notes.find(note => note.id === noteId) || null;
  };