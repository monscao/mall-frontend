import { AuthFormPage } from "pages/AuthFormPage";

export function LoginPage({ navigate }) {
  return <AuthFormPage mode="login" navigate={navigate} />;
}
