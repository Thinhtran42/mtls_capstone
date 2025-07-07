import { useRef, useEffect, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';
import { Box } from '@mui/material';

// Use forwardRef to allow parent components to get a ref to this component
const TinyMCEEditor = forwardRef(({ initialValue, onEditorChange }, ref) => {
  const editorRefInternal = useRef(null);
  const [editorContent, setEditorContent] = useState(initialValue || '');
  const [initialized, setInitialized] = useState(false);
  
  // Tạo một key TĨNH, không đổi theo thời gian để tránh re-render
  const editorKey = useMemo(() => 'tinymce-editor-stable-key', []);
  
  // Cấu hình TinyMCE
  const editorConfig = useMemo(() => ({
    height: 400,
    menubar: true,
    branding: false,
    statusbar: true,
    resize: true,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    // Các tùy chọn quan trọng để tránh vấn đề với React
    entity_encoding: 'raw',
    convert_urls: false,
    inline: false,
    cache_suffix: '?v=' + Date.now(), // Ngăn cache
    init_instance_callback: (editor) => {
      console.log('TinyMCE editor instance initialized.');
      setInitialized(true);
      
      // Chỉ sử dụng sự kiện change để cập nhật nội dung nội bộ
      // KHÔNG gọi setEditorContent trong sự kiện input
      editor.on('change', () => {
        const content = editor.getContent();
        if (onEditorChange && typeof onEditorChange === 'function') {
          // Gọi callback nhưng KHÔNG cập nhật state trong quá trình nhập
          onEditorChange(content);
        }
      });
    }
  }), []); // Loại bỏ dependencies để tránh re-render
  
  // Xử lý khi editor được khởi tạo - chỉ lưu tham chiếu
  const handleEditorInit = (_, editor) => {
    console.log('TinyMCE editor initialized:', editor);
    editorRefInternal.current = editor;
    
    // Thêm nội dung nếu có
    if (initialValue && editor) {
      editor.setContent(initialValue);
    }
  };
  
  // Expose the getContent method to the parent component via the ref
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (editorRefInternal.current) {
        try {
          const content = editorRefInternal.current.getContent({ format: 'html' });
          return content;
        } catch (error) {
          console.error('Error getting content from TinyMCE editor:', error);
          return '';
        }
      }
      return editorContent;
    },
    setContent: (content) => {
      if (editorRefInternal.current) {
        try {
          editorRefInternal.current.setContent(content);
          setEditorContent(content);
          return true;
        } catch (error) {
          console.error('Error setting content in TinyMCE editor:', error);
          return false;
        }
      }
      return false;
    },
    isEmpty: () => {
      if (editorRefInternal.current) {
        try {
          const content = editorRefInternal.current.getContent();
          return !content || content.trim() === '' || content.trim() === '<p></p>' || content.trim() === '<p><br></p>';
        } catch (error) {
          console.error('Error checking if TinyMCE editor is empty:', error);
          return true;
        }
      }
      return true;
    },
    getPlainText: () => {
      if (editorRefInternal.current) {
        const html = editorRefInternal.current.getContent();
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      }
      return '';
    }
  }));
  
  // Xử lý thay đổi initialValue, chỉ cập nhật nếu thực sự thay đổi
  useEffect(() => {
    if (editorRefInternal.current && initialValue !== undefined && initialValue !== editorContent) {
      try {
        editorRefInternal.current.setContent(initialValue);
        setEditorContent(initialValue);
      } catch (error) {
        console.error('Error setting content in TinyMCE editor:', error);
      }
    }
  }, [initialValue]);
  
  // Xử lý khi component unmount - dọn dẹp
  useEffect(() => {
    return () => {
      if (editorRefInternal.current) {
        try {
          editorRefInternal.current.remove();
        } catch (error) {
          console.error('Error removing TinyMCE editor:', error);
        }
      }
    };
  }, []);
  
  return (
    <Box sx={{ border: '1px solid #ddd', mb: 1 }}>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={handleEditorInit}
        key={editorKey}
        initialValue={initialValue}
        init={editorConfig}
      />
    </Box>
  );
});

// Add display name for React DevTools
TinyMCEEditor.displayName = 'TinyMCEEditor';

// Props validation
TinyMCEEditor.propTypes = {
  initialValue: PropTypes.string,
  onEditorChange: PropTypes.func
};

// Default props
TinyMCEEditor.defaultProps = {
  initialValue: ''
};

export default TinyMCEEditor;
export { TinyMCEEditor };