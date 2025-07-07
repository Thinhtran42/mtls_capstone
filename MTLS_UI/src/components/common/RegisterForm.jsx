import { Box, Button, Typography, Snackbar, Alert } from "@mui/material";
import InputField from "./InputField";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import LoginViaSocial from "./LoginViaSocial";
import { authService } from "../../api/services/auth.service";
import { settingsService } from "../../api/services/settings.service";
import { useNavigate, NavLink } from "react-router-dom";

const RegisterForm = () => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({ passwordMinLength: 6 });
  const navigate = useNavigate();
  
  // Lấy cài đặt bảo mật khi component mount
  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        const response = await settingsService.getSystemSettings();
        if (response.data && response.data.security) {
          setSecuritySettings(response.data.security);
        }
      } catch (error) {
        console.error('Không thể lấy cài đặt bảo mật:', error);
      }
    };
    
    fetchSecuritySettings();
  }, []);
  
  // Tạo schema động dựa trên cài đặt passwordMinLength
  const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(securitySettings.passwordMinLength, `Password must be at least ${securitySettings.passwordMinLength} characters`)
      .required("Password is required"),
    fullname: yup.string().required("Full name is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Password confirmation is required"),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]{10,11}$/, "Invalid phone number")
      .required("Phone number is required"),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      fullname: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
    context: { securitySettings }
  });

  const onSubmit = async (data) => {
    if (!isAgreed) {
      setError("You need to agree to the Terms of Use and Privacy Policy");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Prepare data to send according to API requirements
      const signUpData = {
        email: data.email,
        password: data.password,
        fullname: data.fullname,
        phoneNumber: data.phoneNumber,
        role: "student", // Default registration as student
      };

      console.log("Registering with:", signUpData);

      // Call registration API
      const response = await authService.signup(signUpData);
      console.log("Registration successful:", response);

      // Save login information
      if (response.access_token) {
        localStorage.setItem("token", response.access_token);
        console.log("Token saved:", response.access_token);
      }

      if (response.user_id) {
        localStorage.setItem("userId", response.user_id);
        console.log("UserId saved:", response.user_id);
      }

      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        console.log("User info saved:", response.user);
      }

      setSuccess(true);

      // Redirect after 1 second
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);

      // Handle different types of errors
      if (error.response?.data?.message === "Email already exists") {
        setError("Email already exists, please use a different email");
      } else if (error.response?.data?.message && error.response.data.message.includes("Password must be at least")) {
        setError(error.response.data.message);
      } else {
        setError(
          error.response?.data?.message ||
            "Registration failed. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess(false);
  };

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          margin: "0 auto",
          maxWidth: "800px",
          padding: "32px",
          boxShadow: "0 2px 4px rgba(109, 47, 47, 0.1)",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Register
        </Typography>

        <InputField
          name="email"
          label="Email"
          type="email"
          validation={{
            required: "Email is required",
          }}
        />
        <InputField
          name="fullname"
          label="Full Name"
          type="text"
          validation={{
            required: "Full name is required",
          }}
        />
        <InputField
          name="phoneNumber"
          label="Phone Number"
          type="tel"
          validation={{
            required: "Phone number is required",
          }}
        />
        <InputField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          validation={{
            required: "Password is required",
          }}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <InputField
          name="confirmPassword"
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          validation={{
            required: "Password is required",
          }}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <Box>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            style={{ marginRight: "8px" }}
          />
          <Typography variant="body2" color="text.secondary" component="span">
            I have read and agree to the Terms of Use and Privacy Policy
          </Typography>
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ marginTop: "16px", borderRadius: "30px" }}
        >
          {isLoading ? "Registering..." : "Continue"}
        </Button>

        {/* If you have an account? */}
        <Typography variant="body2" color="text.secondary" component="span" sx={{ marginTop: "8px" }}>
          If you have an account?{" "}
          <NavLink
            to="/login"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
            color: "#000",
            }}
          >
            Login
          </NavLink>
        </Typography>

        <LoginViaSocial />
        {/* Error notification */}
        <Snackbar
          open={Boolean(error) || success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={success ? "success" : "error"}
            sx={{ width: "100%" }}
          >
            {success
              ? "Registration successful! Redirecting to login..."
              : error}
          </Alert>
        </Snackbar>
      </Box>
    </FormProvider>
  );
};

export default RegisterForm;
