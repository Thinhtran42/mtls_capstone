import { Navigate, Outlet } from 'react-router-dom';
import { userService } from '../../api/services/user.service';

// Route chỉ cho người chưa đăng nhập truy cập
export const PublicOnlyRoute = () => {
  const user = userService.getCurrentUser();

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher/overview" replace />;
    } else {
      return <Navigate to="/student/overview" replace />;
    }
  }

  // Nếu chưa đăng nhập, cho phép truy cập route
  return <Outlet />;
};

// Route bảo vệ cho người dùng đã đăng nhập (bất kỳ role nào)
export const PrivateRoute = () => {
  const user = userService.getCurrentUser();

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập route
  return <Outlet />;
};

// Route bảo vệ riêng cho admin
export const AdminOnlyRoute = () => {
  const user = userService.getCurrentUser();

  // Nếu chưa đăng nhập hoặc không phải admin, chuyển hướng về trang admin login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace state={{ message: "Bạn cần đăng nhập với quyền admin." }} />;
  }

  // Nếu đã đăng nhập với quyền admin, cho phép truy cập route
  return <Outlet />;
};

// Route bảo vệ riêng cho teacher
export const TeacherOnlyRoute = () => {
  const user = userService.getCurrentUser();

  // Nếu chưa đăng nhập hoặc không phải teacher, chuyển hướng về trang admin login
  if (!user || user.role !== 'teacher') {
    return <Navigate to="/admin/login" replace state={{ message: "Bạn cần đăng nhập với quyền giáo viên." }} />;
  }

  // Nếu đã đăng nhập với quyền teacher, cho phép truy cập route
  return <Outlet />;
};

// Route bảo vệ riêng cho student
export const StudentOnlyRoute = () => {
  const user = userService.getCurrentUser();

  // Nếu chưa đăng nhập hoặc không phải student, chuyển hướng về trang tương ứng
  if (!user) {
    return <Navigate to="/login" replace />;
  } else if (user.role !== 'student') {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace state={{ message: "Bạn không có quyền truy cập trang học viên." }} />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher/overview" replace state={{ message: "Bạn không có quyền truy cập trang học viên." }} />;
    }
  }

  // Nếu đã đăng nhập với quyền student, cho phép truy cập route
  return <Outlet />;
};