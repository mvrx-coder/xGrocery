import { LoginScreen } from "./components/LoginScreen";
import { ShoppingList } from "./components/ShoppingList";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, login, logout } = useAuth();

  if (!user) return <LoginScreen onLogin={login} />;

  return <ShoppingList user={user} onLogout={logout} />;
}
