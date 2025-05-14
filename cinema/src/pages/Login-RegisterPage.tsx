import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/Login-register.sass";
const loginSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(6, "Пароль має містити мінімум 6 символів"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Ім'я має містити мінімум 2 символи"),
    email: z.string().email("Введіть коректний email"),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Введіть коректний номер телефону"),
    password: z.string().min(6, "Пароль має містити мінімум 6 символів"),
    confirmPassword: z.string().min(6, "Підтвердіть пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const LoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post("/users/login", data);
      console.log("Login successful", response.data);
      Cookies.set("token", response.data.token);
      for (const key in response.data.data) {
        console.log(key);
        console.log(response.data.data[key]);
        if (key != "token") {
        Cookies.set(`${key}`, `${response.data.data[key]}`);
        }
        else {
          Cookies.set("token", `${response.data.data[key]}`, {expires: 1})
        }
      }
      navigate("/");
      reset();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-header">Вхід</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div className="login-form-group">
          <label className="login-label">Email</label>
          <input
            type="email"
            {...register("email")}
            className="login-input"
          />
          {errors.email && (
            <p className="login-error">{errors.email.message}</p>
          )}
        </div>

        <div className="login-form-group">
          <label className="login-label">
            Пароль
          </label>
          <input
            type="password"
            {...register("password")}
            className="login-input"
          />
          {errors.password && (
            <p className="login-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="login-button-container">
          <button
            type="submit"
            disabled={isSubmitting}
            className="login-button login-button-primary"
          >
            {isSubmitting ? "Завантаження..." : "Увійти"}
          </button>
        </div>
      </form>
      <div className="no-account">
        <p>Не маєте акаунта?</p>
        <p
          className="no-account-link"
          onClick={() => {
            navigate("/register");
          }}
        >
          Зареєструватись
        </p>
      </div>
    </div>
  );
};

// Компонент реєстрації
const RegisterComponent: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await api.post("/users/register", registerData);
      console.log("Registration successful", response.data);
      navigate("/login");
      reset();
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-header">Реєстрація</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div className="login-form-group">
          <label className="login-label">
            Ім'я
          </label>
          <input
            type="text"
            {...register("name")}
            className="login-input"
          />
          {errors.name && (
            <p className="login-error">{errors.name.message}</p>
          )}
        </div>

        <div className="login-form-group">
          <label className="login-label">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="login-input"
          />
          {errors.email && (
            <p className="login-error">{errors.email.message}</p>
          )}
        </div>

        <div className="login-form-group">
          <label className="login-label">
            Телефон
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="login-input"
          />
          {errors.phone && (
            <p className="login-error">{errors.phone.message}</p>
          )}
        </div>

        <div className="login-form-group">
          <label className="login-label">
            Пароль
          </label>
          <input
            type="password"
            {...register("password")}
            className="login-input"
          />
          {errors.password && (
            <p className="login-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="login-form-group">
          <label className="login-label">
            Підтвердження паролю
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="login-input"
          />
          {errors.confirmPassword && (
            <p className="login-error">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="login-button-container">
          <button
            type="submit"
            disabled={isSubmitting}
            className="login-button login-button-register"
          >
            {isSubmitting ? "Завантаження..." : "Зареєструватися"}
          </button>
        </div>
      </form>
    </div>
  );
};

export { LoginComponent, RegisterComponent };