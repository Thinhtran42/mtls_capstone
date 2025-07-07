/**
 * Tạo slug từ chuỗi tiêu đề
 * @param {string} text Tiêu đề cần tạo slug
 * @returns {string} Slug đã được tạo
 */
export const createSlug = (text) => {
  // Chuyển sang lowercase
  let slug = text.toLowerCase();
  
  // Chuyển các ký tự tiếng Việt sang không dấu
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Thay thế các ký tự đặc biệt và khoảng trắng bằng dấu gạch ngang
  slug = slug.replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
  
  // Xóa dấu gạch ngang ở đầu và cuối
  slug = slug.trim().replace(/^-+|-+$/g, '');
  
  return slug;
};

/**
 * Lưu mapping giữa slug và ID thực
 * @param {string} type Loại đối tượng (course, module, lesson, section)
 * @param {string} slug Slug cần lưu
 * @param {string} id ID thực tương ứng
 */
export const saveSlugMapping = (type, slug, id) => {
  // Lấy mapping hiện tại từ localStorage
  const mappingKey = `${type}Mapping`;
  const currentMapping = JSON.parse(localStorage.getItem(mappingKey) || '{}');
  
  // Thêm mapping mới
  currentMapping[slug] = id;
  
  // Lưu lại vào localStorage
  localStorage.setItem(mappingKey, JSON.stringify(currentMapping));
  console.log(`Saved ${type} mapping:`, slug, '->', id);
};

/**
 * Lấy ID thực từ slug
 * @param {string} type Loại đối tượng (course, module, lesson, section)
 * @param {string} slug Slug cần tìm
 * @returns {string|null} ID thực hoặc null nếu không tìm thấy
 */
export const getIdFromSlug = (type, slug) => {
  // Lấy mapping từ localStorage
  const mappingKey = `${type}Mapping`;
  const mapping = JSON.parse(localStorage.getItem(mappingKey) || '{}');
  
  // Tìm ID tương ứng với slug
  const id = mapping[slug];
  
  console.log(`Getting ${type} ID from slug:`, slug, '->', id || 'not found');
  return id || null;
};

/**
 * Xóa mapping cho một slug
 * @param {string} type Loại đối tượng (course, module, lesson, section)
 * @param {string} slug Slug cần xóa
 */
export const removeSlugMapping = (type, slug) => {
  // Lấy mapping hiện tại từ localStorage
  const mappingKey = `${type}Mapping`;
  const currentMapping = JSON.parse(localStorage.getItem(mappingKey) || '{}');
  
  // Xóa mapping
  if (currentMapping[slug]) {
    delete currentMapping[slug];
    
    // Lưu lại vào localStorage
    localStorage.setItem(mappingKey, JSON.stringify(currentMapping));
    console.log(`Removed ${type} mapping for:`, slug);
  }
};

/**
 * Lấy slug từ ID
 * @param {string} type Loại đối tượng (course, module, lesson, section)
 * @param {string} id ID cần tìm
 * @returns {string|null} Slug hoặc null nếu không tìm thấy
 */
export const getSlugFromId = (type, id) => {
  // Lấy mapping từ localStorage
  const mappingKey = `${type}Mapping`;
  const mapping = JSON.parse(localStorage.getItem(mappingKey) || '{}');
  
  // Tìm slug tương ứng với ID
  for (const [slug, mappedId] of Object.entries(mapping)) {
    if (mappedId === id) {
      console.log(`Getting ${type} slug from ID:`, id, '->', slug);
      return slug;
    }
  }
  
  console.log(`No ${type} slug found for ID:`, id);
  return null;
}; 