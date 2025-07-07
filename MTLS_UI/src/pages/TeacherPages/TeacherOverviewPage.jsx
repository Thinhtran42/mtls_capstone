import { Link } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Container } from '@mui/material';
import { Book as BookIcon, People as PeopleIcon, Assignment as AssignmentIcon, 
  FitnessCenter as FitnessCenterIcon, Help as HelpIcon, Grading as GradingIcon } from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';

const TeacherOverviewPage = () => {
  const managementItems = [
    {
      icon: <BookIcon fontSize="large" />,
      title: 'Course Management',
      linkTo: '/teacher/courses',
      color: '#1976d2'
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: 'Student Management',
      linkTo: '/teacher/students',
      color: '#2e7d32'
    },
    {
      icon: <GradingIcon fontSize="large" />,
      title: 'Assignment Grading',
      linkTo: '/teacher/assignments',
      color: '#00796b'
    },
  ];

  return (
    <>
      <PageTitle title="Teacher Dashboard" />
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)', // Subtract navbar height
        p: 3
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {managementItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <Paper 
                  component={Link}
                  to={item.linkTo}
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTop: `4px solid ${item.color}`,
                    borderRadius: 2,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      color: 'white', 
                      bgcolor: item.color,
                      borderRadius: '50%',
                      p: 2,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 80,
                      height: 80
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="text.primary" textAlign="center">
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                      {item.description}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default TeacherOverviewPage; 