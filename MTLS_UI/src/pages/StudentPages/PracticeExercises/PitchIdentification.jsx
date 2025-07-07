/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Divider, Avatar, IconButton, Collapse } from '@mui/material';
import { usePitchIdentification } from '../../../contexts/PitchIdentificationContext';
import MicIcon from '@mui/icons-material/Mic';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { styled } from '@mui/material/styles';
import { Factory } from 'vexflow';
import * as pitchy from 'pitchy'; // Import thư viện Pitchy

const notes = [
  { id: 'C3', name: 'Đô', minFreq: 123.47, maxFreq: 138.59, notation: 'C/3', displayNotation: 'C/4' },  // Từ giữa B2-C3 đến giữa C3-D3
  { id: 'D3', name: 'Rê', minFreq: 138.59, maxFreq: 155.56, notation: 'D/3', displayNotation: 'D/4' },  // Từ giữa C3-D3 đến giữa D3-E3
  { id: 'E3', name: 'Mi', minFreq: 155.56, maxFreq: 174.61, notation: 'E/3', displayNotation: 'E/4' },  // Từ giữa D3-E3 đến giữa E3-F3
  { id: 'F3', name: 'Fa', minFreq: 174.61, maxFreq: 184.99, notation: 'F/3', displayNotation: 'F/4' },  // Từ giữa E3-F3 đến giữa F3-G3
  { id: 'G3', name: 'Sol', minFreq: 184.99, maxFreq: 207.65, notation: 'G/3', displayNotation: 'G/4' }, // Từ giữa F3-G3 đến giữa G3-A3
  { id: 'A3', name: 'La', minFreq: 207.65, maxFreq: 233.08, notation: 'A/3', displayNotation: 'A/4' },  // Từ giữa G3-A3 đến giữa A3-B3
  { id: 'B3', name: 'Si', minFreq: 233.08, maxFreq: 246.94, notation: 'B/3', displayNotation: 'B/4' },  // Từ giữa A3-B3 đến B3
];

const StaffContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  maxWidth: '500px',
  margin: '20px auto',
  display: 'flex',
  justifyContent: 'center',
  svg: {
    width: '100%',
    height: 'auto',
    maxHeight: '200px'
  }
});

const PitchIdentification = () => {
  const {
    currentNote,
    setCurrentNote,
    isCompleted,
    checkAnswer,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    isListening,
    setIsListening,
    setDetectedPitch,
    feedback,
    setFeedback,
    readyForNextNote,
    setReadyForNextNote
  } = usePitchIdentification();

  const [mediaStream, setMediaStream] = useState(null);
  const staffRef = useRef(null);
  const audioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null); // Ref để lưu trữ scriptProcessor
  const analyserRef = useRef(null); // Ref để lưu trữ analyser
  const microphoneRef = useRef(null); // Ref để lưu trữ microphone source
  const [detectedFrequency, setDetectedFrequency] = useState(null);
  const [logMessages, setLogMessages] = useState([]);
  const [volume, setVolume] = useState(0);
  const [microphoneStatus, setMicrophoneStatus] = useState('Chưa kết nối');
  const [currentDetectedNote, setCurrentDetectedNote] = useState(null);
  const [correctAnswerDetected, setCorrectAnswerDetected] = useState(false);
  const correctAnswerDetectedRef = useRef(false); // Ref để theo dõi trạng thái
  const [countdown, setCountdown] = useState(0);
  const countdownTimerRef = useRef(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [aiHelper, setAiHelper] = useState({
    isVisible: false,
    message: '',
    suggestions: []
  });
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [consecutiveFailedAttempts, setConsecutiveFailedAttempts] = useState(0);
  const MAX_FAILED_ATTEMPTS = 3; // Số lần hát sai tối đa trước khi dừng
  const [lastIncorrectTime, setLastIncorrectTime] = useState(0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useEffect(() => {
    if (!currentNote && !isCompleted) {
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      setCurrentNote(randomNote.id);
      setCurrentQuestionIndex(0);
    }
  }, [currentNote, isCompleted, setCurrentNote, setCurrentQuestionIndex]);

  // Hiển thị nốt nhạc
  const drawNote = (noteId) => {
    if (!staffRef.current || !noteId) {
      console.error('Không thể vẽ nốt nhạc: staffRef.current hoặc noteId không hợp lệ');
      return;
    }

    // Xóa nội dung cũ
    staffRef.current.innerHTML = '';
    console.log(`Đang vẽ nốt: ${noteId}`);

    try {
      const noteObj = notes.find(n => n.id === noteId);
      if (!noteObj) {
        console.error(`Không tìm thấy thông tin cho nốt ${noteId}`);
        return;
      }

      const vf = new Factory({
        renderer: {
          elementId: staffRef.current.id,
          width: 400,
          height: 160,
          type: 'svg'
        }
      });

      const score = vf.EasyScore();
      const stave = vf.Stave({ x: 40, y: 40, width: 300 })
        .addClef('treble')
        .setContext(vf.getContext());

      // Sử dụng displayNotation để hiển thị ở octave 4 thay vì notation ở octave 3
      const formattedNote = noteObj.displayNotation.toLowerCase();

      const staveNote = vf.StaveNote({
        clef: 'treble',
        keys: [formattedNote],
        duration: 'w'
      });

      const voice = score.voice([staveNote]);

      vf.Formatter()
        .joinVoices([voice])
        .format([voice], 250);

      stave.draw();
      voice.draw(vf.getContext(), stave);

      console.log(`Đã vẽ thành công nốt ${noteId} (${noteObj.name}) hiển thị dưới dạng ${formattedNote}`);

    } catch (error) {
      console.error("Lỗi khi vẽ nốt:", error);
      if (staffRef.current) {
        staffRef.current.innerHTML = `
          <div style="text-align: center; color: red; padding: 20px;">
            <p>Lỗi hiển thị ký hiệu nhạc: ${error.message}</p>
          </div>
        `;
      }
    }
  };

  // Thêm hàm tính toán tần số trung bình cho nốt
  const calculateAverageFrequency = (note) => {
    return (note.minFreq + note.maxFreq) / 2;
  };

  // Theo dõi lịch sử hát sai của sinh viên
  const trackIncorrectNote = (detectedNoteId) => {
    const targetNote = notes.find(note => note.id === currentNote);
    const detectedNote = notes.find(note => note.id === detectedNoteId);

    if (!detectedNote || !targetNote || detectedNoteId === currentNote) return;

    // Thêm thông tin về nốt đã hát vào lịch sử
    const newAttempt = {
      timestamp: new Date(),
      targetNote: targetNote.id,
      detectedNote: detectedNoteId,
      frequencyDiff: calculateAverageFrequency(detectedNote) - calculateAverageFrequency(targetNote)
    };

    setAttemptHistory(prev => [newAttempt, ...prev.slice(0, 19)]);  // Giữ tối đa 20 lần thử
    setIncorrectAttempts(prev => prev + 1);

    // Kích hoạt AI helper sau 3 lần thử sai
    if (incorrectAttempts >= 2) {
      analyzeAttempts();
    }
  };

  // Phân tích mẫu lỗi và tạo gợi ý từ AI
  const analyzeAttempts = () => {
    const targetNote = notes.find(note => note.id === currentNote);
    if (!targetNote || attemptHistory.length === 0) return;

    // Lấy các lần thử gần đây cho nốt hiện tại
    const recentAttempts = attemptHistory.filter(a => a.targetNote === currentNote).slice(0, 10);
    if (recentAttempts.length === 0) return;

    // Thống kê chi tiết
    const stats = {
      totalAttempts: recentAttempts.length,
      attemptedNotes: {},
      averageFrequencyDiff: 0,
      frequencyDiffStdDev: 0,
      highestFreqDiff: 0,
      lowestFreqDiff: 0,
      mostFrequentWrongNote: null,
      attemptTimePattern: [], // Thời gian giữa các lần thử
      consistencyScore: 0, // Điểm đánh giá tính nhất quán
      driftPattern: [] // Mẫu trôi của tần số
    };

    // Tính toán thống kê cơ bản
    let totalDiff = 0;
    let diffs = [];

    recentAttempts.forEach((attempt, index) => {
      // Theo dõi các nốt đã thử
      stats.attemptedNotes[attempt.detectedNote] = (stats.attemptedNotes[attempt.detectedNote] || 0) + 1;

      // Lưu trữ độ lệch tần số
      totalDiff += attempt.frequencyDiff;
      diffs.push(attempt.frequencyDiff);

      // Theo dõi mẫu trôi tần số theo thời gian
      if (index > 0) {
        const drift = attempt.frequencyDiff - recentAttempts[index-1].frequencyDiff;
        stats.driftPattern.push(drift);

        // Tính thời gian giữa các lần thử
        const timeDiff = attempt.timestamp - recentAttempts[index-1].timestamp;
        stats.attemptTimePattern.push(timeDiff);
      }
    });

    // Tính trung bình và độ lệch chuẩn
    stats.averageFrequencyDiff = totalDiff / recentAttempts.length;

    // Tính độ lệch chuẩn
    const squaredDiffs = diffs.map(diff => Math.pow(diff - stats.averageFrequencyDiff, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / diffs.length;
    stats.frequencyDiffStdDev = Math.sqrt(avgSquaredDiff);

    // Tìm độ lệch lớn nhất và nhỏ nhất
    stats.highestFreqDiff = Math.max(...diffs);
    stats.lowestFreqDiff = Math.min(...diffs);

    // Tìm nốt sai phổ biến nhất
    let maxCount = 0;
    for (const [note, count] of Object.entries(stats.attemptedNotes)) {
      if (count > maxCount && note !== targetNote.id) {
        maxCount = count;
        stats.mostFrequentWrongNote = note;
      }
    }

    // Tính điểm nhất quán - càng thấp càng không nhất quán
    stats.consistencyScore = 1 / (stats.frequencyDiffStdDev || 1);

    console.log("Thống kê chi tiết:", stats);

    // Phân tích xu hướng hát sai từ dữ liệu thu thập
    const isConsistentlyHigher = stats.averageFrequencyDiff > 0 && stats.lowestFreqDiff >= -2; // Nới lỏng điều kiện
    const isConsistentlyLower = stats.averageFrequencyDiff < 0 && stats.highestFreqDiff <= 2; // Nới lỏng điều kiện
    const isVeryInconsistent = stats.consistencyScore < 0.2; // Điểm nhất quán thấp
    const hasDriftingPitch = stats.driftPattern.length > 0 &&
      stats.driftPattern.reduce((sum, val) => sum + Math.abs(val), 0) / stats.driftPattern.length > 5;
    const isRushingAttempts = stats.attemptTimePattern.length > 0 &&
      stats.attemptTimePattern.reduce((sum, val) => sum + val, 0) / stats.attemptTimePattern.length < 1000; // Dưới 1 giây

    // Xác định nốt gần nhất mà học sinh thường hát nhầm
    const nearestWrongNote = stats.mostFrequentWrongNote ?
      notes.find(note => note.id === stats.mostFrequentWrongNote) : null;

    // Tạo thông điệp AI và gợi ý dựa trên phân tích chi tiết
    let message = '';
    const suggestions = [];

    // Tùy chỉnh lời khuyên dựa trên phân tích
    if (isConsistentlyHigher) {
      message = `Tôi nhận thấy bạn hát cao hơn nốt ${targetNote.name} (${targetNote.id}) khoảng ${Math.abs(stats.averageFrequencyDiff).toFixed(1)}Hz. Hãy thử hạ giọng xuống một chút.`;
      suggestions.push('Thử hơi thở sâu từ cơ hoành và giữ hơi ổn định');
      suggestions.push('Tưởng tượng âm thanh đang đi từ trên xuống');
      suggestions.push('Hát nhẹ nhàng hơn, không gắng sức để kiểm soát cao độ tốt hơn');

      // Thêm gợi ý cụ thể dựa trên mức độ lệch
      if (stats.averageFrequencyDiff > 20) {
        suggestions.push('Bạn đang hát cao hơn nhiều, hãy hạ giọng xuống khoảng 1 nốt nhạc');
      } else if (stats.averageFrequencyDiff > 5) {
        suggestions.push('Bạn đang hát hơi cao, hãy điều chỉnh nhẹ giọng xuống');
      }
    } else if (isConsistentlyLower) {
      message = `Tôi nhận thấy bạn hát thấp hơn nốt ${targetNote.name} (${targetNote.id}) khoảng ${Math.abs(stats.averageFrequencyDiff).toFixed(1)}Hz. Hãy thử nâng giọng lên một chút.`;
      suggestions.push('Tưởng tượng âm thanh đang đi từ dưới lên và tập trung vào khoang cộng hưởng ở đầu');
      suggestions.push('Nâng vị trí cằm lên nhẹ nhàng khi hát');
      suggestions.push('Thêm năng lượng và sự tỉnh táo khi phát âm');

      // Thêm gợi ý cụ thể dựa trên mức độ lệch
      if (Math.abs(stats.averageFrequencyDiff) > 20) {
        suggestions.push('Bạn đang hát thấp hơn nhiều, hãy nâng giọng lên khoảng 1 nốt nhạc');
      } else if (Math.abs(stats.averageFrequencyDiff) > 5) {
        suggestions.push('Bạn đang hát hơi thấp, hãy điều chỉnh nhẹ giọng lên');
      }
    } else if (isVeryInconsistent) {
      message = `Tôi nhận thấy cao độ của bạn không ổn định khi cố gắng hát nốt ${targetNote.name} (${targetNote.id}). Độ lệch của bạn dao động nhiều từ ${stats.lowestFreqDiff.toFixed(1)}Hz đến ${stats.highestFreqDiff.toFixed(1)}Hz.`;
      suggestions.push('Tập trung vào việc duy trì hơi thở ổn định');
      suggestions.push('Lắng nghe nốt nhạc chuẩn kỹ hơn trước khi thử hát');
      suggestions.push('Thử hát nốt nhạc bằng âm "mmm" trước để tìm đúng vị trí');
      suggestions.push('Luyện tập tìm nốt bằng cách trượt từ từ giọng từ thấp lên cao cho đến khi tìm đúng cao độ');
    } else if (hasDriftingPitch) {
      message = `Tôi nhận thấy cao độ của bạn đang bị trôi khi hát nốt ${targetNote.name} (${targetNote.id}). Khi bạn cố gắng giữ nốt, cao độ có xu hướng thay đổi dần.`;
      suggestions.push('Tập trung vào việc duy trì hơi thở và áp lực ổn định khi phát âm');
      suggestions.push('Luyện tập giữ một nốt nhạc trong thời gian dài (khoảng 5-10 giây)');
      suggestions.push('Thực hành các bài tập kiểm soát hơi thở như đếm chậm khi thở ra');
    } else if (isRushingAttempts) {
      message = `Tôi nhận thấy bạn đang hát quá nhanh, không dành đủ thời gian để cảm nhận và điều chỉnh giọng cho nốt ${targetNote.name} (${targetNote.id}).`;
      suggestions.push('Hãy chậm lại và dành thời gian lắng nghe nốt nhạc chuẩn');
      suggestions.push('Thử nghĩ đến nốt nhạc trong đầu trước khi hát ra');
      suggestions.push('Tập trung vào chất lượng hơn là số lượng các lần thử');
    } else if (nearestWrongNote) {
      // Phân tích liên quan đến nốt sai cụ thể
      const noteCompare = nearestWrongNote.id > targetNote.id ? "cao hơn" : "thấp hơn";
      message = `Tôi nhận thấy bạn thường hát nốt ${nearestWrongNote.name} (${nearestWrongNote.id}) thay vì ${targetNote.name} (${targetNote.id}). Nốt ${nearestWrongNote.name} ${noteCompare} nốt mục tiêu.`;
      suggestions.push(`Hãy lưu ý sự khác biệt giữa nốt ${targetNote.name} và ${nearestWrongNote.name}`);
      suggestions.push('Thử hát chậm giữa hai nốt này để cảm nhận sự khác biệt');
      suggestions.push(`Luyện tập các bài tập trượt giọng từ ${targetNote.name} đến ${nearestWrongNote.name} và ngược lại`);
    } else {
      message = `Tôi thấy bạn đang có một số khó khăn với nốt ${targetNote.name} (${targetNote.id}). Phân tích chi tiết hơn về các mẫu lỗi của bạn có thể giúp cải thiện.`;
      suggestions.push('Tập trung vào việc lắng nghe và cảm nhận nốt nhạc trước khi hát');
      suggestions.push('Thực hành các bài tập trượt giọng để tìm đúng cao độ');
      suggestions.push('Thử ngân nga nốt nhạc nhẹ nhàng trước khi hát to');
    }

    // Thêm thông tin về tần số mục tiêu
    const targetFreq = calculateAverageFrequency(targetNote).toFixed(1);
    suggestions.push(`Tần số cần đạt khoảng ${targetFreq}Hz (${targetNote.minFreq.toFixed(1)}-${targetNote.maxFreq.toFixed(1)}Hz)`);

    // Thêm liên kết đến tài nguyên hữu ích nếu có
    if (Math.abs(stats.averageFrequencyDiff) > 15) {
      suggestions.push('Bạn có thể tìm kiếm các bài tập phát triển thính giác trên YouTube để luyện tập thêm');
    }

    setAiHelper({
      isVisible: true,
      message,
      suggestions
    });
  };

  // Thêm hàm forceShowAiHelper để đảm bảo AI helper được hiển thị
  const forceShowAiHelper = () => {
    console.log("Hiển thị AI helper...");

    // Nếu có dữ liệu lịch sử đủ lớn, phân tích nó
    if (attemptHistory.length > 0) {
      analyzeAttempts();
    }

    // Nếu không có gợi ý nào được tạo từ analyzeAttempts, tạo một phân tích chi tiết hơn
    if (!aiHelper.isVisible || aiHelper.suggestions.length === 0) {
      const targetNote = notes.find(note => note.id === currentNote);
      if (targetNote) {
        // Thu thập dữ liệu từ các lần hát gần đây nếu có
        let recentFrequencies = logMessages
          .map(log => {
            const match = log.match(/Phát hiện: (\d+\.\d+) Hz/);
            return match ? parseFloat(match[1]) : null;
          })
          .filter(freq => freq !== null);

        // Đưa ra gợi ý thông minh hơn dựa trên dữ liệu hiện có
        let message = `Tôi đang phân tích cách bạn hát nốt ${targetNote.name} (${targetNote.id}).`;
        let suggestions = [];

        if (recentFrequencies.length > 0) {
          // Có dữ liệu tần số gần đây
          const avgFreq = recentFrequencies.reduce((sum, freq) => sum + freq, 0) / recentFrequencies.length;
          const targetFreq = calculateAverageFrequency(targetNote);
          const diff = avgFreq - targetFreq;

          if (diff > 5) {
            message = `Dựa trên ${recentFrequencies.length} mẫu gần đây, tôi thấy bạn đang hát cao hơn nốt ${targetNote.name} khoảng ${diff.toFixed(1)}Hz.`;
            suggestions = [
              'Hãy thử hát nhẹ nhàng hơn, với ít áp lực hơn',
              'Tưởng tượng âm thanh đang đi xuống, thấp hơn',
              'Thử hát với âm lượng nhỏ hơn để tìm đúng cao độ',
              `Tập trung vào việc đạt tần số ${targetFreq.toFixed(1)}Hz thay vì ${avgFreq.toFixed(1)}Hz hiện tại`
            ];
          } else if (diff < -5) {
            message = `Dựa trên ${recentFrequencies.length} mẫu gần đây, tôi thấy bạn đang hát thấp hơn nốt ${targetNote.name} khoảng ${(-diff).toFixed(1)}Hz.`;
            suggestions = [
              'Hãy thử mỉm cười nhẹ khi hát để nâng cao độ lên',
              'Tưởng tượng âm thanh đang đi lên, cao hơn',
              'Thử điều chỉnh tư thế, ngồi hoặc đứng thẳng hơn',
              `Tập trung vào việc đạt tần số ${targetFreq.toFixed(1)}Hz thay vì ${avgFreq.toFixed(1)}Hz hiện tại`
            ];
          } else {
            message = `Dựa trên ${recentFrequencies.length} mẫu gần đây, bạn đang hát gần đúng cao độ nhưng chưa ổn định.`;
            suggestions = [
              'Hãy tập trung vào việc duy trì cao độ ổn định',
              'Thử giữ nốt lâu hơn và lắng nghe sự dao động',
              'Thực hành hát và nghe đồng thời để tự điều chỉnh'
            ];
          }
        } else {
          // Không có dữ liệu tần số, đưa ra gợi ý chung
          message = `Tôi chưa thu thập đủ dữ liệu về cách bạn hát nốt ${targetNote.name} (${targetNote.id}).`;
          suggestions = [
            'Hãy bắt đầu bằng việc lắng nghe nốt chuẩn trước khi thử hát',
            'Thử hát nhẹ nhàng từ nốt thấp lên cao để tìm vị trí của nốt',
            'Điều chỉnh hơi thở và tư thế để có âm thanh ổn định',
            'Thử nghĩ về nốt nhạc trong đầu trước khi hát'
          ];
        }

        // Thêm thông tin tần số mục tiêu
        suggestions.push(`Tần số cần đạt: ${calculateAverageFrequency(targetNote).toFixed(1)}Hz (${targetNote.minFreq.toFixed(1)}-${targetNote.maxFreq.toFixed(1)}Hz)`);

        // Cung cấp một vài kỹ thuật hữu ích
        suggestions.push('Kỹ thuật: Thử sử dụng "sirens" (hát trượt giọng từ thấp lên cao) để tìm và nhận biết đúng cao độ');

        setAiHelper({
          isVisible: true,
          message,
          suggestions
        });
      }
    }
  };

  // Sửa lại handleNoteDetected để sử dụng biến countdown chính thống
  const handleNoteDetected = (detectedNoteId) => {
    // Kiểm tra nếu đã phát hiện nốt đúng thì không làm gì cả
    if (correctAnswerDetected || correctAnswerDetectedRef.current) {
      return;
    }

    const isCorrect = checkAnswer(detectedNoteId);
    const currentTime = Date.now();

    if (isCorrect && isListening) {
      console.log('⭐ ĐÃ PHÁT HIỆN NỐT ĐÚNG!');

      // ĐẶT CỜ NGAY LẬP TỨC!! - Đây là bước quan trọng nhất!
      correctAnswerDetectedRef.current = true;

      // Lưu thông tin nốt đúng
      const detectedNoteInfo = notes.find(n => n.id === detectedNoteId);
      if (detectedNoteInfo) {
        setCurrentDetectedNote(detectedNoteInfo);
      }

      // DỪNG THU ÂM NGAY LẬP TỨC
      try {
        // DỪNG TRACKS
        if (mediaStream) {
          const tracks = mediaStream.getTracks();
          console.log(`Dừng ${tracks.length} tracks...`);
          tracks.forEach((track) => {
            track.stop();
            console.log(`Track ${track.label} đã dừng`);
          });
          // Xóa tham chiếu
          setMediaStream(null);
        }

        // ĐÓNG AUDIOCONTEXT
        if (audioContextRef.current) {
          if (audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            console.log('AudioContext đã đóng');
          }
          audioContextRef.current = null;
        }
      } catch (error) {
        console.error('Lỗi khi dừng thu âm:', error);
      }

      // Cập nhật trạng thái React
      console.log('Cập nhật trạng thái UI...');
      setCorrectAnswerDetected(true);
      setIsListening(false);
      setMicrophoneStatus('Đã ngắt kết nối');
      setConsecutiveFailedAttempts(0);

      // Reset AI helper
      setAiHelper({
        isVisible: false,
        message: '',
        suggestions: []
      });
      setIncorrectAttempts(0);

      // ĐIỀU QUAN TRỌNG: Force re-render ngay lập tức
      setTimeout(() => {
        console.log('Đảm bảo UI đã được cập nhật với nốt đúng');
      }, 0);

      // Bắt đầu đếm ngược để chuyển sang nốt tiếp theo
      let timeRemaining = 5;
      setCountdown(timeRemaining);

      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      countdownTimerRef.current = setInterval(() => {
        timeRemaining -= 1;
        setCountdown(timeRemaining);
        console.log('Đếm ngược:', timeRemaining);

        if (timeRemaining <= 0) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          console.log('Đếm ngược hoàn tất, chuyển câu mới');
          moveToNextQuestion();
        }
      }, 1000);
    } else if (isListening) {
      // Chỉ tăng số lần thất bại khi:
      // 1. Nốt phát hiện khác nốt hiện tại
      // 2. Đã qua ít nhất 1 giây kể từ lần phát hiện sai cuối cùng
      if (detectedNoteId !== currentNote && currentTime - lastIncorrectTime > 1000) {
        const newFailCount = consecutiveFailedAttempts + 1;
        console.log(`Hát sai lần thứ ${newFailCount}, nốt ${detectedNoteId} thay vì ${currentNote}`);

        // Cập nhật thời gian phát hiện sai cuối cùng
        setLastIncorrectTime(currentTime);
        setConsecutiveFailedAttempts(newFailCount);
        trackIncorrectNote(detectedNoteId);

        // QUAN TRỌNG: Bắt buộc kiểm tra lại newFailCount
        if (newFailCount >= MAX_FAILED_ATTEMPTS) {
          console.log(`Đã hát sai ${MAX_FAILED_ATTEMPTS} lần, dừng thu âm và hiển thị AI helper`);
          stopListening();
          forceShowAiHelper();
        }
      }
    }
  };

  // Trong moveToNextQuestion, dùng lại biến countdown chính thống
  const moveToNextQuestion = () => {
    console.log('Đang chuyển sang câu hỏi mới...');

    // Xóa bộ đếm hiện tại nếu có
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    // Dừng thu âm nếu vẫn đang thu
    if (isListening) {
      stopListening();
    }

    // Cập nhật chỉ số câu hỏi
    const nextQuestionIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextQuestionIndex);
    console.log('Chỉ số câu hỏi mới:', nextQuestionIndex);

    // Chọn một nốt ngẫu nhiên khác với nốt hiện tại
    let randomNote;
    do {
      randomNote = notes[Math.floor(Math.random() * notes.length)];
    } while (randomNote.id === currentNote);

    console.log('Nốt mới được chọn:', randomNote.id);

    // Đặt lại tất cả trạng thái
    setFeedback('');
    setCorrectAnswerDetected(false);
    setCountdown(0);
    setIsListening(false);
    setMicrophoneStatus('Chưa kết nối');
    setDetectedFrequency(null);
    setCurrentDetectedNote(null);
    setLogMessages([]);
    setVolume(0);
    setDetectedPitch(null);
    if (typeof setReadyForNextNote === 'function') {
      setReadyForNextNote(false);
    }
    setConsecutiveFailedAttempts(0);

    // Cập nhật nốt hiện tại - Thực hiện việc này sau khi đã đặt lại trạng thái
    setCurrentNote(randomNote.id);

    // Đảm bảo vẽ lại nốt nhạc mới
    setTimeout(() => {
      drawNote(randomNote.id);
      console.log('Đã vẽ lại nốt nhạc mới');
    }, 100);

    // Reset AI helper
    setAiHelper({
      isVisible: false,
      message: '',
      suggestions: []
    });
    setIncorrectAttempts(0);
  };

  // Vẽ nốt nhạc khi currentNote thay đổi
  useEffect(() => {
    if (currentNote) {
      console.log('CurrentNote thay đổi, vẽ lại nốt:', currentNote);
      drawNote(currentNote);
    }
  }, [currentNote]);

  const startListening = async () => {
    console.log('=== BẮT ĐẦU QUÁ TRÌNH THU ÂM MỚI ===');

    // QUAN TRỌNG: Nếu đã phát hiện nốt đúng, không cho phép bắt đầu thu âm
    if (correctAnswerDetected || correctAnswerDetectedRef.current) {
      console.log('⚠️ Không bắt đầu thu âm vì đã phát hiện nốt đúng');
      return;
    }

    // 1. RESET TẤT CẢ REF QUAN TRỌNG - LÀM TRƯỚC TIÊN
    correctAnswerDetectedRef.current = false;

    // 2. RESET TẤT CẢ STATE
    setCorrectAnswerDetected(false);
    setFeedback('');
    setLogMessages([]);
    setCurrentDetectedNote(null);
    setDetectedFrequency(null);
    setConsecutiveFailedAttempts(0);

    // 3. ẨN AI HELPER NẾU ĐANG HIỂN THỊ
    if (aiHelper.isVisible) {
      setAiHelper({
        isVisible: false,
        message: '',
        suggestions: []
      });
    }

    // Đặt trạng thái isListening ngay từ đầu
    setIsListening(true);

    if (countdownTimerRef.current) {
      return;
    }

    try {
      setMicrophoneStatus('Đang kết nối...');

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        console.log("Resuming AudioContext...");
        await audioContext.resume();
      }

      console.log("AudioContext state:", audioContext.state);
      console.log("Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      console.log("Microphone access granted!");
      const audioTracks = stream.getAudioTracks();
      console.log(`Found ${audioTracks.length} audio tracks`);

      audioTracks.forEach((track, index) => {
        console.log(`Track ${index}: ${track.label}`);
        console.log("Settings:", JSON.stringify(track.getSettings()));
        try {
          console.log("Capabilities:", JSON.stringify(track.getCapabilities()));
        } catch (e) {
          console.log("Could not get capabilities:", e);
        }
      });

      setMediaStream(stream);
      setMicrophoneStatus('Đã kết nối');

      const microphone = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      microphone.connect(analyser);

      // Lưu tham chiếu để có thể dừng và ngắt kết nối sau này
      microphoneRef.current = microphone;
      analyserRef.current = analyser;

      const bufferSize = 4096;
      let scriptProcessor;

      try {
        scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
        scriptProcessorRef.current = scriptProcessor; // Lưu scriptProcessor vào ref
        console.log(`ScriptProcessor được tạo với bufferSize: ${bufferSize}`);
      } catch (error) {
        console.error("Lỗi khi tạo ScriptProcessor:", error);
        setMicrophoneStatus(`Lỗi: Không thể tạo bộ xử lý âm thanh.`);
        return;
      }

      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      let debugCounter = 0;

      scriptProcessor.onaudioprocess = function(event) {
        // KIỂM TRA NGAY LẬP TỨC với guard clause (kiểm tra đầu tiên)
        if (correctAnswerDetectedRef.current === true) {
          console.log('⛔ PHÁT HIỆN NỐT ĐÚNG - DỪNG XỬ LÝ ÂM THANH NGAY LẬP TỨC!');

          // Ngắt kết nối tất cả
          try {
            if (scriptProcessor && scriptProcessor.disconnect) {
              scriptProcessor.disconnect();
              console.log('Đã ngắt kết nối scriptProcessor từ callback');

              // Dừng mọi track
              if (mediaStream) {
                const tracks = mediaStream.getTracks();
                tracks.forEach(track => {
                  track.stop();
                  console.log(`Đã dừng track ${track.label} từ callback`);
                });
              }

              // Đóng AudioContext từ callback
              if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(e => {
                  console.warn('Lỗi khi đóng AudioContext từ callback:', e);
                });
                console.log('Đã đóng AudioContext từ callback');
              }
            }
          } catch (err) {
            console.warn('Lỗi khi dừng âm thanh từ callback:', err);
          }

          return; // Dừng xử lý
        }

        // Phần còn lại của xử lý âm thanh
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }

        const avgVolume = sum / inputData.length;
        setVolume(avgVolume * 100);

        debugCounter++;
        if (debugCounter % 10 === 0) {
          console.log(`Volume: ${avgVolume * 100}`);
          console.log(`Sample data [0-4]: ${inputData[0]}, ${inputData[1]}, ${inputData[2]}, ${inputData[3]}, ${inputData[4]}`);
          const hasNonZeroSamples = inputData.some(sample => sample !== 0);
          console.log(`Has non-zero samples: ${hasNonZeroSamples}`);
          console.log(`Trạng thái đang lắng nghe: ${isListening}, Đã phát hiện nốt đúng (state): ${correctAnswerDetected}, Đã phát hiện nốt đúng (ref): ${correctAnswerDetectedRef.current}`);
        }

        if (avgVolume < 0.005) {
          return;
        }

        let fundamentalFreq;

        try {
          if (typeof pitchy !== 'undefined') {
            try {
              const bufferSize = 2048;
              const detector = new pitchy.PitchDetector({
                sampleRate: audioContext.sampleRate,
                bufferSize: bufferSize
              });

              const processBuffer = new Float32Array(bufferSize);
              processBuffer.fill(0);

              const copyLength = Math.min(inputData.length, bufferSize);
              for (let i = 0; i < copyLength; i++) {
                processBuffer[i] = inputData[i];
              }

              const hasNonZeroData = processBuffer.some(val => val !== 0);
              if (!hasNonZeroData) {
                return;
              }

              const result = detector.findPitch(processBuffer);
              const pitch = result.freq;
              const clarity = result.clarity;

              if (clarity > 0.5 && pitch > 50 && pitch < 1500) {
                fundamentalFreq = pitch;
                console.log(`Pitchy detected: ${pitch} Hz with clarity ${clarity}`);
              }
            } catch (pitchyError) {
              console.error("Error using Pitchy:", pitchyError);
            }
          }

          if (!fundamentalFreq) {
            const dataArray = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(dataArray);

            let maxIndex = 0;
            let maxValue = -Infinity;
            const minFreq = 80;
            const maxFreq = 1500;

            for (let i = 0; i < dataArray.length; i++) {
              const frequency = i * audioContext.sampleRate / analyser.fftSize;
              if (frequency >= minFreq && frequency <= maxFreq && dataArray[i] > maxValue) {
                maxValue = dataArray[i];
                maxIndex = i;
              }
            }

            if (maxValue > -70) {
              fundamentalFreq = maxIndex * audioContext.sampleRate / analyser.fftSize;
              console.log(`FFT detected: ${fundamentalFreq} Hz with magnitude ${maxValue}dB`);
            }
          }

          if (fundamentalFreq > 0) {
            if (correctAnswerDetected) {
              return;
            }

            // Tìm nốt phù hợp dựa trên dải tần số
            let matchedNote = null;
            for (const note of notes) {
              if (fundamentalFreq >= note.minFreq && fundamentalFreq <= note.maxFreq) {
                matchedNote = note;
                break;
              }
            }

            // Nếu không tìm thấy nốt phù hợp, tìm nốt gần nhất
            if (!matchedNote) {
              matchedNote = notes.reduce((prev, curr) => {
                const prevDistance = Math.min(
                  Math.abs(fundamentalFreq - prev.minFreq),
                  Math.abs(fundamentalFreq - prev.maxFreq)
                );
                const currDistance = Math.min(
                  Math.abs(fundamentalFreq - curr.minFreq),
                  Math.abs(fundamentalFreq - curr.maxFreq)
                );
                return prevDistance < currDistance ? prev : curr;
              });
            }

            console.log(`Tần số phát hiện: ${fundamentalFreq.toFixed(2)}Hz, Nốt phù hợp: ${matchedNote.name} (${matchedNote.id})`);

            setDetectedFrequency(fundamentalFreq.toFixed(2));
            setCurrentDetectedNote(matchedNote);
            setDetectedPitch(matchedNote.id);

            // Tính độ lệch dựa trên tần số trung bình
            const avgFrequency = calculateAverageFrequency(matchedNote);
            const cents = 1200 * Math.log2(fundamentalFreq / avgFrequency);
            const centsText = cents.toFixed(0) > 0 ? `+${cents.toFixed(0)}` : cents.toFixed(0);

            // Tạo thông tin log
            const inRange = fundamentalFreq >= matchedNote.minFreq && fundamentalFreq <= matchedNote.maxFreq;
            const rangeStatus = inRange ? "trong khoảng" : "ngoài khoảng";
            const newLog = `Phát hiện: ${fundamentalFreq.toFixed(1)} Hz, ${matchedNote.name} (${matchedNote.id}), ${rangeStatus}, độ lệch: ${centsText} cents`;

            setLogMessages(prev => {
              if (prev.length === 0 || !prev[0].includes(matchedNote.id)) {
                return [newLog, ...prev.slice(0, 5)];
              }
              return prev;
            });

            // Kiểm tra nếu tần số nằm trong khoảng của nốt đó
            if (inRange) {
              console.log(`🎯 Tần số ${fundamentalFreq.toFixed(1)}Hz nằm trong khoảng của nốt ${matchedNote.id} (${matchedNote.minFreq}-${matchedNote.maxFreq}Hz)`);

              // Kiểm tra nếu nốt này là nốt đúng
              if (matchedNote.id === currentNote) {
                console.log('🔔 PHÁT HIỆN NỐT ĐÚNG TRONG ONAUDIOPROCESS!');
                // Đặt cờ ngay lập tức để ngăn các lần gọi tiếp theo và dừng quá trình xử lý
                correctAnswerDetectedRef.current = true;
              }

              // Gọi hàm xử lý
              handleNoteDetected(matchedNote.id);
            } else if (matchedNote.id !== currentNote) {
              // Khi hát một nốt sai (không phải nốt hiện tại), gọi handleNoteDetected
              console.log(`Phát hiện nốt sai: ${matchedNote.id}, nốt đúng là: ${currentNote}`);
              handleNoteDetected(matchedNote.id);
            }
          }
        } catch (error) {
          console.error("Lỗi khi xử lý tần số:", error);
        }
      };
    } catch (error) {
      console.error("Lỗi khi bắt đầu lắng nghe:", error);
      setMicrophoneStatus('Lỗi: Không thể bắt đầu lắng nghe');
    }
  };

  const stopListening = () => {
    console.log("=== DỪNG QUÁ TRÌNH THU ÂM ===");
    console.log("Trạng thái correctAnswerDetected:", correctAnswerDetected);
    console.log("Trạng thái ref:", correctAnswerDetectedRef.current);

    // Đảm bảo cập nhật state
    setIsListening(false);

    // Dừng mediaStream
    if (mediaStream) {
      console.log("Dừng tất cả audio tracks");
      const tracks = mediaStream.getTracks();
      console.log(`Số lượng tracks cần dừng: ${tracks.length}`);
      tracks.forEach(track => {
        const trackState = track.readyState;
        console.log(`Dừng track: ${track.label}, trạng thái hiện tại: ${trackState}`);
        track.stop();
        console.log(`Trạng thái track sau khi dừng: ${track.readyState}`);
      });
      setMediaStream(null);
    } else {
      console.log("Không có mediaStream để dừng");
    }

    if (audioContextRef.current) {
      console.log(`Đóng AudioContext (trạng thái hiện tại: ${audioContextRef.current.state})`);
      try {
        // Đối với một số trình duyệt, có thể không đóng được AudioContext ngay lập tức
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().then(() => {
            console.log('AudioContext đã đóng thành công');
          }).catch(error => {
            console.error('Lỗi khi đóng AudioContext:', error);
          });
        }
        audioContextRef.current = null;
      } catch (error) {
        console.error("Lỗi khi đóng AudioContext:", error);
      }
    } else {
      console.log("Không có AudioContext để đóng");
    }

    setMicrophoneStatus('Đã ngắt kết nối');
    setVolume(0);

    // Chỉ xóa thông tin về tần số và nốt nếu chưa phát hiện đúng nốt
    if (!correctAnswerDetected) {
      console.log("Xóa thông tin tần số và nốt vì chưa phát hiện đúng nốt");
      setDetectedFrequency(null);
      setCurrentDetectedNote(null);
    } else {
      console.log("Giữ lại thông tin tần số và nốt vì đã phát hiện đúng nốt");
    }

    console.log("Đã dừng quá trình thu âm thành công");
  };

  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }

      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isListening]);

  useEffect(() => {
    // Thêm keyframes cho animation pulse
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (readyForNextNote && isListening && currentDetectedNote?.id === currentNote) {
      console.log('Nốt đúng đã được xác nhận từ context, tiến hành xử lý');
      handleNoteDetected(currentDetectedNote.id);
    }
  }, [readyForNextNote, isListening, currentDetectedNote, currentNote, handleNoteDetected]);

  useEffect(() => {
    // Khi số lần thất bại đạt ngưỡng, đảm bảo AI helper hiển thị
    if (consecutiveFailedAttempts >= MAX_FAILED_ATTEMPTS && isListening) {
      console.log("Đạt ngưỡng thất bại, dừng thu âm và hiển thị AI helper");
      stopListening();
      forceShowAiHelper();
      //setFeedback(`Bạn đã hát sai ${MAX_FAILED_ATTEMPTS} lần liên tiếp. Hãy xem gợi ý để cải thiện.`);
    }
  }, [consecutiveFailedAttempts, isListening, MAX_FAILED_ATTEMPTS, currentNote]);

  // Hàm tạo và phát âm thanh chuẩn cho nốt nhạc hiện tại
  const playReferenceNote = () => {
    if (!currentNote || isPlayingSound) return;

    setIsPlayingSound(true);

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const noteObj = notes.find(n => n.id === currentNote);

      if (!noteObj) {
        console.error(`Không tìm thấy thông tin cho nốt ${currentNote}`);
        setIsPlayingSound(false);
        return;
      }

      // Tính toán tần số chuẩn cho nốt
      const frequency = calculateAverageFrequency(noteObj);
      console.log(`Phát âm thanh chuẩn cho nốt ${noteObj.name} (${noteObj.id}) với tần số: ${frequency}Hz`);

      // Tạo oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Cấu hình dạng sóng và tần số
      oscillator.type = 'sine'; // Dạng sóng sin cho âm thanh mượt mà
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // Cấu hình biên độ sóng âm (volume) và thời gian fade-in/fade-out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1); // Fade in
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5); // Fade out

      // Kết nối các node
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Bắt đầu và dừng oscillator
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.5);

      // Khi kết thúc, đặt lại trạng thái
      oscillator.onended = () => {
        setTimeout(() => {
          setIsPlayingSound(false);
        }, 100);
        audioContext.close();
      };
    } catch (error) {
      console.error("Lỗi khi phát âm thanh:", error);
      setIsPlayingSound(false);
    }
  };

  // Thêm hàm đổi nốt
  const changeNote = () => {
    // Dừng phát âm nếu đang phát
    if (isPlayingSound) return;

    // Dừng thu âm nếu đang thu
    if (isListening) {
      stopListening();
    }

    // Xóa bộ đếm nếu đang đếm
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    // Chọn một nốt ngẫu nhiên khác với nốt hiện tại
    let randomNote;
    do {
      randomNote = notes[Math.floor(Math.random() * notes.length)];
    } while (randomNote.id === currentNote);

    console.log('Đổi nốt từ', currentNote, 'sang', randomNote.id);

    // QUAN TRỌNG: Reset tham chiếu trước khi reset state
    correctAnswerDetectedRef.current = false;
    console.log('Đã reset correctAnswerDetectedRef:', correctAnswerDetectedRef.current);

    // Đặt lại tất cả trạng thái
    setFeedback('');
    setCorrectAnswerDetected(false);
    setCountdown(0);
    setIsListening(false);
    setMicrophoneStatus('Chưa kết nối');
    setDetectedFrequency(null);
    setCurrentDetectedNote(null);
    setLogMessages([]);
    setVolume(0);
    setDetectedPitch(null);
    if (typeof setReadyForNextNote === 'function') {
      setReadyForNextNote(false);
    }
    setConsecutiveFailedAttempts(0);

    // Ẩn AI helper nếu đang hiển thị
    if (aiHelper.isVisible) {
      setAiHelper({
        isVisible: false,
        message: '',
        suggestions: []
      });
    }

    // Cập nhật nốt hiện tại
    setCurrentNote(randomNote.id);

    // Đảm bảo vẽ lại nốt nhạc mới
    setTimeout(() => {
      drawNote(randomNote.id);
      console.log('Đã vẽ lại nốt nhạc mới');
    }, 100);
  };

  // Cập nhật ref mỗi khi correctAnswerDetected thay đổi
  useEffect(() => {
    correctAnswerDetectedRef.current = correctAnswerDetected;
    console.log("correctAnswerDetectedRef cập nhật:", correctAnswerDetectedRef.current);
  }, [correctAnswerDetected]);

  return (
    <Box sx={{
      p: 3,
      ml: 40,
      maxWidth: '1000px',
      mx: 'auto',
      bgcolor: '#fff',
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid #e0e0e0'
    }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{
          color: '#1a1a1a',
          fontWeight: 'bold',
          mb: 4,
          fontSize: { xs: '1.8rem', md: '2.2rem' }
        }}
      >
        Nhận Diện Cao Độ Bằng Giọng Hát
      </Typography>

      <Box sx={{
        textAlign: 'center',
        my: 4,
        maxWidth: '800px',
        mx: 'auto'
      }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 3,
            my: 2,
            mx: 'auto',
            maxWidth: 500,
            bgcolor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            mb={2}
            sx={{
              fontWeight: 'bold',
              color: '#0F62FE'
            }}
          >
            Hãy hát nốt:
          </Typography>

          <StaffContainer>
            <div
              id="pitch-staff"
              ref={staffRef}
              style={{ width: '100%', height: '250px' }}
            />
          </StaffContainer>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 'bold',
                color: '#666'
              }}
            >
              {notes.find(note => note.id === currentNote)?.name}
            </Typography>

            <IconButton
              color="primary"
              onClick={playReferenceNote}
              disabled={isPlayingSound}
              sx={{
                ml: 1,
                bgcolor: isPlayingSound ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.12)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <VolumeUpIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {!isListening && (
            <Button
              variant="contained"
              color={aiHelper.isVisible ? "warning" : correctAnswerDetected ? "success" : "primary"}
              startIcon={<MicIcon />}
              onClick={correctAnswerDetected ? moveToNextQuestion :
                      aiHelper.isVisible ? startListening : startListening}
              sx={{
                my: 3,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: 'none',
                bgcolor: aiHelper.isVisible ? '#ff9800' :
                        correctAnswerDetected ? '#28a745' : '#0F62FE',
                '&:hover': {
                  bgcolor: aiHelper.isVisible ? '#f57c00' :
                          correctAnswerDetected ? '#218838' : '#0043a8',
                },
                display: correctAnswerDetected ? 'none' : 'flex' // Ẩn nút khi đã hát đúng
              }}
            >
              {correctAnswerDetected ? 'Chuyển nốt khác' :
                aiHelper.isVisible ? 'Thử lại' : 'Bắt Đầu Hát'}
            </Button>
          )}

          {!correctAnswerDetected && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<SwapHorizIcon />}
              onClick={changeNote}
              disabled={isPlayingSound}
              sx={{
                my: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'medium',
                border: '2px solid #9c27b0',
                '&:hover': {
                  bgcolor: 'rgba(156, 39, 176, 0.08)',
                  border: '2px solid #9c27b0',
                }
              }}
            >
              Đổi Nốt
            </Button>
          )}

          {/* Thêm nút hướng dẫn */}
          {!correctAnswerDetected && !aiHelper.isVisible && (
            <Button
              variant="outlined"
              color="info"
              startIcon={<HelpOutlineIcon />}
              onClick={forceShowAiHelper}
              sx={{
                my: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
                border: '2px solid #0288d1',
                '&:hover': {
                  bgcolor: 'rgba(2, 136, 209, 0.08)',
                  border: '2px solid #0288d1',
                }
              }}
            >
              Xem hướng dẫn
            </Button>
          )}
        </Box>

        {/* Hiển thị tần số và nốt phát hiện trong thời gian thực */}
        {isListening && detectedFrequency && !correctAnswerDetected && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              my: 3,
              p: 3,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #dee2e6',
              maxWidth: '500px',
              mx: 'auto',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Typography variant="h6" sx={{ color: '#333', mb: 1, fontWeight: 'bold' }}>
              Đang phát hiện
            </Typography>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              width: '100%',
              mt: 1
            }}>
              <Box sx={{
                textAlign: 'center',
                p: 2,
                borderRadius: '50%',
                width: 100,
                height: 100,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: currentDetectedNote?.id === currentNote ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                border: `2px solid ${currentDetectedNote?.id === currentNote ? '#28a745' : '#dc3545'}`,
                transition: 'all 0.3s ease'
              }}>
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  color: currentDetectedNote?.id === currentNote ? '#28a745' : '#dc3545'
                }}>
                  {currentDetectedNote?.name || '?'}
                </Typography>
                <Typography variant="caption" sx={{ mt: -0.5 }}>
                  {currentDetectedNote?.id || '?'}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'medium', color: '#0F62FE' }}>
                  {detectedFrequency} Hz
                </Typography>

                {currentDetectedNote && currentNote && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: currentDetectedNote.id === currentNote ? '#28a745' : '#dc3545',
                      fontWeight: 'medium'
                    }}
                  >
                    {currentDetectedNote.id === currentNote
                      ? '✓ Đúng nốt!'
                      : `✗ Khác với ${notes.find(n => n.id === currentNote)?.name || currentNote}`}
                  </Typography>
                )}

                {/* Thêm hiển thị chênh lệch tần số và cents */}
                {currentDetectedNote && currentNote && parseFloat(detectedFrequency) > 0 && (
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    {(() => {
                      const targetNote = notes.find(n => n.id === currentNote);
                      const targetFreq = calculateAverageFrequency(targetNote);
                      const freqDiff = parseFloat(detectedFrequency) - targetFreq;
                      const cents = 1200 * Math.log2(parseFloat(detectedFrequency) / targetFreq);
                      const absFreqDiff = Math.abs(freqDiff).toFixed(1);
                      const absCents = Math.abs(cents).toFixed(0);
                      const isHigher = freqDiff > 0;
                      const color = Math.abs(cents) < 30 ? '#28a745' : Math.abs(cents) < 60 ? '#ffc107' : '#dc3545';

                      return (
                        <>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            bgcolor: 'rgba(0,0,0,0.03)',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            mt: 1
                          }}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              Tần số mục tiêu: <b>{targetFreq.toFixed(1)} Hz</b>
                            </Typography>

                            <Typography variant="caption" sx={{ color: color, fontWeight: 'bold' }}>
                              {isHigher ? `+${absFreqDiff} Hz (${absCents} cents cao hơn)` :
                                        `-${absFreqDiff} Hz (${absCents} cents thấp hơn)`}
                            </Typography>
                          </Box>
                        </>
                      );
                    })()}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Thêm hiệu ứng trực quan cho chênh lệch cao độ */}
            {currentDetectedNote && currentNote && (
              <Box sx={{
                width: '100%',
                mt: 3,
                pt: 2,
                borderTop: '1px dashed #dee2e6',
              }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                  Hướng dẫn điều chỉnh cao độ:
                </Typography>

                {(() => {
                  // Tính toán mức độ chênh lệch dựa trên chỉ số trong mảng nốt
                  const targetNoteIndex = notes.findIndex(n => n.id === currentNote);
                  const detectedNoteIndex = notes.findIndex(n => n.id === currentDetectedNote.id);
                  const difference = detectedNoteIndex - targetNoteIndex;

                  // Tính phần trăm chênh lệch cho thanh trực quan
                  const calcDifferencePercent = () => {
                    if (difference === 0) return 50; // Giữa thanh nếu đúng
                    const maxDiff = 3; // Giới hạn chênh lệch tối đa
                    const limitedDiff = Math.max(-maxDiff, Math.min(maxDiff, difference));
                    return 50 + (limitedDiff / maxDiff) * 45; // 5% - 95%
                  };

                  const diffPercent = calcDifferencePercent();

                  // Xác định màu và thông điệp dựa vào chênh lệch
                  let message = '';
                  let arrowColor = '';

                  if (difference === 0) {
                    message = 'Cao độ chính xác!';
                    arrowColor = '#28a745';
                  } else if (difference > 0) {
                    message = 'Hát cao hơn nốt cần hát';
                    arrowColor = '#dc3545';
                  } else {
                    message = 'Hát thấp hơn nốt cần hát';
                    arrowColor = '#dc3545';
                  }

                  return (
                    <>
                      <Typography variant="body2" sx={{
                        textAlign: 'center',
                        color: difference === 0 ? '#28a745' : '#dc3545',
                        fontWeight: difference === 0 ? 'bold' : 'normal',
                        mb: 1
                      }}>
                        {message}
                      </Typography>

                      <Box sx={{
                        position: 'relative',
                        height: '36px',
                        bgcolor: '#e9ecef',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        border: '1px solid #ced4da'
                      }}>
                        {/* Thanh chỉ báo */}
                        <Box sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          px: 2
                        }}>
                          <Typography variant="caption" sx={{ color: '#666' }}>Thấp hơn</Typography>
                          <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>Chính xác</Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>Cao hơn</Typography>
                        </Box>

                        {/* Mũi tên chỉ báo */}
                        <Box sx={{
                          position: 'absolute',
                          left: `${diffPercent}%`,
                          top: 0,
                          height: '100%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'left 0.15s ease-out'
                        }}>
                          <Box sx={{
                            width: '20px',
                            height: '20px',
                            bgcolor: arrowColor,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {difference === 0 ? '✓' : difference > 0 ? '↓' : '↑'}
                          </Box>
                        </Box>
                      </Box>

                      {Math.abs(difference) > 0 && (
                        <Typography variant="caption" sx={{
                          display: 'block',
                          mt: 1,
                          textAlign: 'center',
                          color: '#666'
                        }}>
                          {difference > 0
                            ? 'Cần hạ thấp giọng xuống'
                            : 'Cần nâng cao giọng lên'}
                        </Typography>
                      )}
                    </>
                  );
                })()}
              </Box>
            )}

            {/* Hiển thị log messages ngắn gọn */}
            {logMessages.length > 0 && (
              <Box sx={{
                mt: 2,
                width: '100%',
                maxHeight: '100px',
                overflowY: 'auto',
                borderTop: '1px solid #dee2e6',
                pt: 1
              }}>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', textAlign: 'left' }}>
                  {logMessages[0]}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {correctAnswerDetected && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              my: 3,
              p: 3,
              bgcolor: 'rgba(40, 167, 69, 0.1)',
              borderRadius: 2,
              border: '1px solid #28a745',
              maxWidth: '500px',
              mx: 'auto',
              animation: 'pulse 1.5s infinite',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ribbon thành công */}
            <Box sx={{
              position: 'absolute',
              top: 15,
              right: -30,
              backgroundColor: '#28a745',
              color: 'white',
              padding: '5px 30px',
              transform: 'rotate(45deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              zIndex: 1
            }}>
              Thành công!
            </Box>

            <Typography
              variant="h5"
              sx={{
                color: '#218838',
                fontWeight: 'bold',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box component="span" sx={{
                display: 'inline-flex',
                bgcolor: '#28a745',
                color: 'white',
                borderRadius: '50%',
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                mr: 1
              }}>✓</Box>
              Đúng nốt!
            </Typography>

            {/* Hiển thị thông tin nốt đã hát đúng */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              bgcolor: 'rgba(255,255,255,0.7)',
              px: 3,
              py: 1,
              borderRadius: 2,
              mb: 2
            }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                Nốt: <span style={{ fontWeight: 'bold', color: '#218838' }}>{currentDetectedNote?.name || '?'} ({currentDetectedNote?.id || '?'})</span>
              </Typography>
              {detectedFrequency && (
                <Typography variant="body1" sx={{ fontWeight: 'medium', ml: 1 }}>
                  • <span style={{ color: '#0F62FE' }}>{detectedFrequency} Hz</span>
                </Typography>
              )}
            </Box>

            {/* Hiển thị thời gian đếm ngược và thêm nút */}
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Box sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: 80,
                height: 80
              }}>
                <CircularProgress
                  variant="determinate"
                  value={countdown * 20} // 5 giây = 100%
                  size={80}
                  thickness={4}
                  sx={{ color: '#0F62FE' }}
                />
                <Box sx={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h4" sx={{ color: '#0F62FE', fontWeight: 'bold' }}>
                    {countdown}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={moveToNextQuestion}
                  sx={{
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#218838'
                    }
                  }}
                >
                  Chuyển nốt ngay
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    // Hủy đếm ngược nếu có
                    if (countdownTimerRef.current) {
                      clearInterval(countdownTimerRef.current);
                      countdownTimerRef.current = null;
                    }
                    // Bắt đầu lại với nốt hiện tại
                    setCorrectAnswerDetected(false);
                    setCountdown(0);
                    startListening();
                  }}
                  sx={{
                    borderRadius: 2,
                    border: '2px solid #0F62FE',
                    '&:hover': {
                      bgcolor: 'rgba(15, 98, 254, 0.08)',
                      border: '2px solid #0F62FE'
                    }
                  }}
                >
                  Thử lại nốt này
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {feedback && !correctAnswerDetected && (
          <Typography
            variant="h6"
            color={feedback.includes('Chính xác') ? 'success.main' : 'error.main'}
            sx={{
              my: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: feedback.includes('Chính xác') ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
              fontWeight: 'bold'
            }}
          >
            {feedback}
          </Typography>
        )}

        {/* Add AI Helper component */}
        {aiHelper.isVisible && (
          <Paper
            elevation={3}
            sx={{
              mt: 4,
              p: 3,
              border: '1px solid #4caf50',
              borderRadius: 2,
              backgroundColor: '#f8f9fa',
              maxWidth: '600px',
              mx: 'auto',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                <SmartToyIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                Trợ lý AI
              </Typography>
              <IconButton
                sx={{ ml: 'auto' }}
                onClick={() => setShowAiDetails(!showAiDetails)}
                aria-label={showAiDetails ? 'Thu gọn' : 'Mở rộng'}
              >
                {showAiDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
              {aiHelper.message}
            </Typography>

            <Collapse in={showAiDetails}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                <LightbulbIcon sx={{ mr: 1, color: '#f9a825' }} />
                Gợi ý cải thiện:
              </Typography>

              <Box sx={{ pl: 2 }}>
                {aiHelper.suggestions.map((suggestion, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1, color: '#555' }}>
                    • {suggestion}
                  </Typography>
                ))}
              </Box>
            </Collapse>
          </Paper>
        )}

      </Box>
    </Box>
  );
};

export default PitchIdentification;