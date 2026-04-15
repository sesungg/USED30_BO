import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleGate } from './components/common/RoleGate';
import { AppShell } from './components/layout/AppShell';
import type { ReactNode } from 'react';

import LoginPage from './pages/Login/index';
import DashboardPage from './pages/Dashboard/index';
import InspectionListPage from './pages/Inspections/List';
import InspectionDetailPage from './pages/Inspections/Detail';
import OrderListPage from './pages/Orders/List';
import OrderDetailPage from './pages/Orders/Detail';
import OrderReturnPage from './pages/Orders/Return';
import ProductListPage from './pages/Products/List';
import ProductDetailPage from './pages/Products/Detail';
import SettlementListPage from './pages/Settlements/List';
import SettlementDetailPage from './pages/Settlements/Detail';
import UserListPage from './pages/Users/List';
import UserDetailPage from './pages/Users/Detail';
import NoticeListPage from './pages/Notices/List';
import NoticeDetailPage from './pages/Notices/Detail';
import CouponListPage from './pages/Coupons/List';
import CouponDetailPage from './pages/Coupons/Detail';
import BannerListPage from './pages/Banners/List';
import BannerDetailPage from './pages/Banners/Detail';
import EventListPage from './pages/Events/List';
import EventDetailPage from './pages/Events/Detail';
import FaqListPage from './pages/Faq/List';
import FaqDetailPage from './pages/Faq/Detail';
import AdminListPage from './pages/Admins/List';
import AdminDetailPage from './pages/Admins/Detail';
import PermissionsPage from './pages/Permissions/index';
import AuditLogsPage from './pages/AuditLogs/index';
import LoginLogsPage from './pages/LoginLogs/index';
import SettingsPage from './pages/Settings/index';

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={
              <AdminLayout><RoleGate section="dashboard"><DashboardPage /></RoleGate></AdminLayout>
            } />

            <Route path="/inspections" element={
              <AdminLayout><RoleGate section="inspections"><InspectionListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/inspections/:id" element={
              <AdminLayout><RoleGate section="inspections"><InspectionDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/orders" element={
              <AdminLayout><RoleGate section="orders"><OrderListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/orders/:id" element={
              <AdminLayout><RoleGate section="orders"><OrderDetailPage /></RoleGate></AdminLayout>
            } />
            <Route path="/orders/:id/return" element={
              <AdminLayout><RoleGate section="orders"><OrderReturnPage /></RoleGate></AdminLayout>
            } />

            <Route path="/products" element={
              <AdminLayout><RoleGate section="products"><ProductListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/products/:id" element={
              <AdminLayout><RoleGate section="products"><ProductDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/settlements" element={
              <AdminLayout><RoleGate section="settlements"><SettlementListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/settlements/:id" element={
              <AdminLayout><RoleGate section="settlements"><SettlementDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/users" element={
              <AdminLayout><RoleGate section="users"><UserListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/users/:id" element={
              <AdminLayout><RoleGate section="users"><UserDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/notices" element={
              <AdminLayout><RoleGate section="notices"><NoticeListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/notices/:id" element={
              <AdminLayout><RoleGate section="notices"><NoticeDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/coupons" element={
              <AdminLayout><RoleGate section="coupons"><CouponListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/coupons/:id" element={
              <AdminLayout><RoleGate section="coupons"><CouponDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/banners" element={
              <AdminLayout><RoleGate section="banners"><BannerListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/banners/:id" element={
              <AdminLayout><RoleGate section="banners"><BannerDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/events" element={
              <AdminLayout><RoleGate section="events"><EventListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/events/:id" element={
              <AdminLayout><RoleGate section="events"><EventDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/faq" element={
              <AdminLayout><RoleGate section="faq"><FaqListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/faq/:id" element={
              <AdminLayout><RoleGate section="faq"><FaqDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/admins" element={
              <AdminLayout><RoleGate section="admins"><AdminListPage /></RoleGate></AdminLayout>
            } />
            <Route path="/admins/:id" element={
              <AdminLayout><RoleGate section="admins"><AdminDetailPage /></RoleGate></AdminLayout>
            } />

            <Route path="/permissions" element={
              <AdminLayout><RoleGate section="permissions"><PermissionsPage /></RoleGate></AdminLayout>
            } />

            <Route path="/audit-logs" element={
              <AdminLayout><RoleGate section="audit_logs"><AuditLogsPage /></RoleGate></AdminLayout>
            } />

            <Route path="/login-logs" element={
              <AdminLayout><RoleGate section="login_logs"><LoginLogsPage /></RoleGate></AdminLayout>
            } />

            <Route path="/settings" element={
              <AdminLayout><RoleGate section="settings"><SettingsPage /></RoleGate></AdminLayout>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
