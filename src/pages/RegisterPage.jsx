import { AuthFormPage } from "./shared/AuthFormPage";

export function RegisterPage({ navigate }) {
  return <AuthFormPage mode="register" navigate={navigate} />;
}
