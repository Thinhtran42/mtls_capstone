import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import AdvancedSearch from '../common/AdvancedSearch';
import SearchFilterBar from '../common/SearchFilterBar';
import { advancedSearch } from '../../utils/stringUtils';

const SearchExamplePage = () => {
  // Demo data
  const sampleStudents = [
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', grade: 'A', course: 'Nhạc lý cơ bản' },
    { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@example.com', grade: 'B', course: 'Hòa âm' },
    { id: 3, name: 'Lê Hoàng Cường', email: 'cuong.le@example.com', grade: 'A+', course: 'Nhạc lý cơ bản' },
    { id: 4, name: 'Phạm Diễm', email: 'diem.pham@example.com', grade: 'C', course: 'Thang âm & Điệu thức' },
    { id: 5, name: 'Hoàng Văn Em', email: 'em.hoang@example.com', grade: 'B+', course: 'Sáng tác' },
    { id: 6, name: 'Nguyễn Thị Giang', email: 'giang.nguyen@example.com', grade: 'A', course: 'Hòa âm' },
    { id: 7, name: 'Trần Văn Hùng', email: 'hung.tran@example.com', grade: 'B', course: 'Phân tích nhạc' },
    { id: 8, name: 'Vũ Thị Lan', email: 'lan.vu@example.com', grade: 'A-', course: 'Thang âm & Điệu thức' },
  ];

  const courses = [
    { value: 'Nhạc lý cơ bản', label: 'Nhạc lý cơ bản' },
    { value: 'Hòa âm', label: 'Hòa âm' },
    { value: 'Thang âm & Điệu thức', label: 'Thang âm & Điệu thức' },
    { value: 'Sáng tác', label: 'Sáng tác' },
    { value: 'Phân tích nhạc', label: 'Phân tích nhạc' }
  ];

  const grades = [
    { value: 'A+', label: 'A+' },
    { value: 'A', label: 'A' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' }
  ];

  // States
  const [searchData, setSearchData] = useState({ rawTerm: '' });
  const [filteredStudents, setFilteredStudents] = useState(sampleStudents);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('list');

  // Xử lý tìm kiếm
  const handleSearch = (data) => {
    setSearchData(data);
    applyFiltersAndSearch(data, filters);
  };

  // Xử lý lọc
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFiltersAndSearch(searchData, newFilters);
  };

  // Áp dụng tìm kiếm và lọc
  const applyFiltersAndSearch = (searchData, currentFilters) => {
    let results = [...sampleStudents];

    // Áp dụng tìm kiếm
    if (searchData && searchData.rawTerm) {
      results = results.filter(student => 
        advancedSearch(student.name, searchData.rawTerm) || 
        advancedSearch(student.email, searchData.rawTerm)
      );
    }

    // Áp dụng lọc khoá học
    if (currentFilters.course && currentFilters.course !== 'all') {
      results = results.filter(student => student.course === currentFilters.course);
    }

    // Áp dụng lọc điểm
    if (currentFilters.grade && currentFilters.grade !== 'all') {
      results = results.filter(student => student.grade === currentFilters.grade);
    }

    setFilteredStudents(results);
  };

  // Demo đơn giản cho AdvancedSearch
  const renderSimpleSearchExample = () => (
    <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>1. Demo tìm kiếm cơ bản</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Thử nhập "nguyen" để tìm các học sinh họ "Nguyễn", hoặc nhập "nva" để tìm "Nguyễn Văn An"
      </Typography>
      
      <AdvancedSearch 
        placeholder="Tìm kiếm học sinh..."
        onSearch={data => {
          const filteredResults = sampleStudents.filter(student => 
            advancedSearch(student.name, data.rawTerm)
          );
          setFilteredStudents(filteredResults);
        }}
      />
      
      <List sx={{ mt: 2 }}>
        {filteredStudents.slice(0, 3).map(student => (
          <ListItem key={student.id}>
            <ListItemText 
              primary={student.name} 
              secondary={student.email} 
            />
          </ListItem>
        ))}
        {filteredStudents.length > 3 && (
          <ListItem>
            <ListItemText primary={`và ${filteredStudents.length - 3} học sinh khác...`} />
          </ListItem>
        )}
      </List>
    </Paper>
  );

  // Demo đầy đủ với SearchFilterBar
  const renderFullSearchExample = () => (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>2. Demo thanh tìm kiếm và lọc kết hợp</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Sử dụng thanh công cụ để lọc và tìm kiếm. Thử tìm với dấu, không dấu hoặc viết tắt.
      </Typography>
      
      <SearchFilterBar
        searchPlaceholder="Tìm học sinh theo tên hoặc email..."
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onViewModeChange={setViewMode}
        filterOptions={[
          {
            name: 'course',
            label: 'Khoá học',
            width: 3,
            options: courses
          },
          {
            name: 'grade',
            label: 'Điểm số',
            width: 2,
            options: grades
          }
        ]}
        sortOptions={[
          { value: 'name', label: 'Theo tên' },
          { value: 'grade', label: 'Theo điểm' }
        ]}
        enableViewModeSwitch={true}
      />
      
      {viewMode === 'list' ? (
        <Paper elevation={0} sx={{ mt: 2 }}>
          <List>
            {filteredStudents.map((student, index) => (
              <Box key={student.id}>
                <ListItem>
                  <ListItemText 
                    primary={
                      <Box sx={{ fontWeight: 'bold' }}>{student.name}</Box>
                    } 
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          Email: {student.email}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span" color="text.secondary">
                          Khoá học: {student.course}
                        </Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            ml: 2, 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            bgcolor: 'primary.50', 
                            color: 'primary.main',
                            display: 'inline-block',
                            fontSize: '0.75rem'
                          }}
                        >
                          Điểm: {student.grade}
                        </Box>
                      </>
                    } 
                  />
                </ListItem>
                {index < filteredStudents.length - 1 && <Divider />}
              </Box>
            ))}
            {filteredStudents.length === 0 && (
              <ListItem>
                <ListItemText primary="Không tìm thấy học sinh nào phù hợp" />
              </ListItem>
            )}
          </List>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {filteredStudents.map(student => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>{student.name.charAt(0)}</Avatar>
                    <Typography variant="h6">{student.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Email: {student.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Khoá học: {student.course}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        bgcolor: 'primary.50', 
                        color: 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      Điểm: {student.grade}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filteredStudents.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Không tìm thấy học sinh nào phù hợp</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Demo các tính năng tìm kiếm nâng cao
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Các component tìm kiếm này hỗ trợ tìm kiếm tiếng Việt thông minh, cho phép tìm kiếm với/không dấu,
        tìm theo viết tắt (chữ cái đầu mỗi từ), và tìm theo từng từ riêng lẻ.
      </Typography>
      
      {renderSimpleSearchExample()}
      {renderFullSearchExample()}
    </Container>
  );
};

export default SearchExamplePage; 