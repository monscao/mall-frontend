import { AuthFormPage } from "pages/AuthFormPage";

export function RegisterPage({ navigate }) {
  return <AuthFormPage mode="register" navigate={navigate} />;
}
