import { AuthFormPage } from "./shared/AuthFormPage";

export function LoginPage({ navigate }) {
  return <AuthFormPage mode="login" navigate={navigate} />;
}
