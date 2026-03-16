import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { hasSession } from './services/auth';

const isAllowedEnvironment = () =>
  import.meta.env.MODE !== 'production' || import.meta.env.VITE_ALLOW_DEV_ADMIN === 'true';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  if (!hasSession()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const EnvironmentBlockedPage = () => (
  <main className="shell shell--center">
    <section className="panel panel--narrow">
      <span className="eyebrow">Environment blocked</span>
      <h1>개발 환경 전용 화면입니다</h1>
      <p className="muted">
        이 어드민은 개발계 테스트 데이터 조작 용도로만 열어두는 것을 전제로 합니다.
      </p>
    </section>
  </main>
);

function App() {
  if (!isAllowedEnvironment()) {
    return <EnvironmentBlockedPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
