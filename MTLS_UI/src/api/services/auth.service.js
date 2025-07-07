import { baseApi } from '../generated/baseApi';
import { auth } from '../../firebase/config';
import { GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver, } from 'firebase/auth';

// Tạo service wrapper
export const authService = {
    login: async(email, password) => {
        try {
            const response = await baseApi.auth.authControllerLogin({ email, password });
            console.log('Response từ API login:', response);

            // Lưu token và thông tin user từ response
            if (response.data) {
                const { access_token, user } = response.data;

                if (access_token) {
                    localStorage.setItem('token', access_token);
                    console.log('Đã lưu access_token vào localStorage');
                }

                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('Đã lưu thông tin user vào localStorage:', user);

                    if (user._id) {
                        localStorage.setItem('userId', user._id);
                        console.log('Đã lưu userId vào localStorage:', user._id);
                    }
                }
            } else {
                console.warn('Không nhận được dữ liệu từ API login!');
            }

            return response.data;
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            throw error;
        }
    },

    // Thêm phương thức adminLogin dành cho giáo viên/admin
    adminLogin: async(email, password) => {
        try {
            const response = await baseApi.auth.authControllerLogin({ email, password });
            console.log('Response từ API admin login:', response);

            // Lưu token và thông tin user từ response
            if (response.data) {
                const { access_token, user } = response.data;

                if (access_token) {
                    localStorage.setItem('token', access_token);
                    console.log('Đã lưu access_token vào localStorage');
                }

                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('Đã lưu thông tin user vào localStorage:', user);

                    if (user._id) {
                        localStorage.setItem('userId', user._id);
                        console.log('Đã lưu userId vào localStorage:', user._id);
                    }
                }
            } else {
                console.warn('Không nhận được dữ liệu từ API admin login!');
            }

            return response.data;
        } catch (error) {
            console.error('Lỗi đăng nhập admin:', error);
            throw error;
        }
    },

    loginWithGoogle: async() => {
        try {
            console.log('Bắt đầu quá trình đăng nhập Google...');

            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            // Thêm custom parameters
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            // Sử dụng popup thay vì redirect
            const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
            console.log('Đã nhận được kết quả từ Google:', {
                email: result.user.email,
                displayName: result.user.displayName,
                uid: result.user.uid
            });

            // Lấy và log token
            const idToken = await result.user.getIdToken();
            console.log('Google ID Token:', idToken);

            // Gửi token đến backend để xác thực
            console.log('Gửi token đến backend để xác thực...');
            const response = await baseApi.auth.authControllerVerifyGoogleToken({
                idToken: idToken
            });

            console.log('Phản hồi từ backend:', response.data);

            // Xử lý response từ backend
            if (response.data) {
                const { access_token, user } = response.data;

                if (access_token) {
                    localStorage.setItem('token', access_token);
                    console.log('Đã lưu access_token vào localStorage');
                } else {
                    console.warn('Không nhận được access_token từ backend');
                }

                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('Đã lưu thông tin user vào localStorage:', user);

                    if (user._id) {
                        localStorage.setItem('userId', user._id);
                        console.log('Đã lưu userId vào localStorage:', user._id);
                    }
                } else {
                    console.warn('Không nhận được thông tin user từ backend');
                }

                return response.data;
            } else {
                throw new Error('Không nhận được dữ liệu từ backend');
            }

        } catch (error) {
            console.error('Chi tiết lỗi đăng nhập Google:', {
                code: error.code,
                message: error.message,
                fullError: error
            });

            // Xử lý các lỗi cụ thể của popup
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Đăng nhập đã bị hủy bởi người dùng');
            }
            if (error.code === 'auth/popup-blocked') {
                throw new Error('Popup đã bị chặn. Vui lòng cho phép popup và thử lại');
            }
            if (error.response && error.response.status === 401) {
                throw new Error('Token Google không hợp lệ hoặc đã hết hạn');
            }
            throw error;
        }
    },

    signup: async(userData) => {
        try {
            const response = await baseApi.auth.authControllerSignup(userData);
            console.log('Response từ API signup:', response);

            // Lưu token và thông tin user từ response
            if (response.data) {
                const { access_token, user } = response.data;

                if (access_token) {
                    localStorage.setItem('token', access_token);
                    console.log('Đã lưu access_token vào localStorage');
                }

                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('Đã lưu thông tin user vào localStorage:', user);

                    if (user._id) {
                        localStorage.setItem('userId', user._id);
                        console.log('Đã lưu userId vào localStorage:', user._id);
                    }
                }
            }

            return response.data;
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        auth.signOut();
    },

    forgotPassword: async(email) => {
        try {
            const response = await baseApi.auth.authControllerForgotPassword({ email });
            console.log('Response từ API forgot password:', response);
            return response.data;
        } catch (error) {
            console.error('Lỗi quên mật khẩu:', error);
            throw error;
        }
    },

    resetPassword: async(token, newPassword) => {
        try {
            const response = await baseApi.auth.authControllerResetPassword({ 
                token, 
                newPassword 
            });
            console.log('Response từ API reset password:', response);
            return response.data;
        } catch (error) {
            console.error('Lỗi đặt lại mật khẩu:', error);
            throw error;
        }
    }
};