/**
 * Bộ tiện ích xử lý chuỗi và hỗ trợ tìm kiếm
 */

/**
 * Chuyển chuỗi tiếng Việt có dấu thành không dấu
 * Ví dụ: "Nguyễn Văn A" -> "Nguyen Van A"
 */
export const removeVietnameseTones = (str) => {
  if (!str) return '';
  
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  
  return str;
};

/**
 * Lấy chữ cái đầu tiên của mỗi từ trong chuỗi
 * Ví dụ: "Nguyễn Văn A" -> "nva"
 */
export const getInitials = (text) => {
  if (!text) return '';
  
  return removeVietnameseTones(text)
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toLowerCase();
};

/**
 * Tách chuỗi thành mảng các từ và chuyển sang chữ thường không dấu
 * Ví dụ: "Nguyễn Văn A" -> ["nguyen", "van", "a"]
 */
export const getWords = (text) => {
  if (!text) return [];
  
  return removeVietnameseTones(text).toLowerCase().split(' ');
};

/**
 * Kiểm tra xem một chuỗi có chứa từ khóa tìm kiếm hay không
 * Hỗ trợ tìm kiếm tiếng Việt không dấu, viết tắt, và từng từ
 */
export const advancedSearch = (textToSearch, searchTerm) => {
  if (!textToSearch || !searchTerm) return false;
  
  const searchTermLower = removeVietnameseTones(searchTerm.toLowerCase().trim());
  
  if (searchTermLower === '') return true;
  
  // Tạo các dạng chuỗi cần tìm kiếm
  const textInitials = getInitials(textToSearch);
  const textWords = getWords(textToSearch);
  const searchWords = searchTermLower.split(' ');
  
  // Kiểm tra nếu mỗi từ khóa tìm kiếm xuất hiện trong văn bản
  // hoặc là viết tắt của văn bản
  return searchWords.every(searchWord => 
    textInitials.includes(searchWord) || 
    textWords.some(word => word.includes(searchWord))
  );
};

/**
 * Lọc mảng dữ liệu dựa trên thuộc tính và từ khóa tìm kiếm
 * @param {Array} items - Mảng dữ liệu cần lọc
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string|Array} searchFields - Tên thuộc tính cần tìm kiếm hoặc mảng các tên thuộc tính
 */
export const filterItems = (items, searchTerm, searchFields) => {
  if (!items || !searchTerm) return items;
  
  const fieldsToSearch = Array.isArray(searchFields) ? searchFields : [searchFields];
  
  return items.filter(item => {
    return fieldsToSearch.some(field => {
      const fieldValue = item[field];
      if (!fieldValue) return false;
      
      return advancedSearch(fieldValue, searchTerm);
    });
  });
}; 