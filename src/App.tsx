import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importando componentes da nova estrutura (usando alias @)
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import UserDashboard from '@/pages/user/UserDashboard';
import ProfileSection from '@/pages/user/ProfileSection';
import ComunidadeSection from '@/pages/user/ComunidadeSection';
import TopicDetail from '@/pages/user/TopicDetail';
import Home from '@/pages/home/home';
import EventsListPage from '@/pages/events/EventsListPage';
import EventDetailPage from '@/pages/events/EventDetailPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOverview from '@/pages/admin/AdminOverview';
import EventsManager from '@/pages/admin/events/EventsManager';
import FinancialManager from '@/pages/admin/financial/FinancialManager';
import GalleryManager from '@/pages/admin/gallery/GalleryManager';
import GalleryInfinity from '@/pages/admin/gallery/galleryinfinity';
import GalleryPage from '@/pages/gallery/GalleryPage';
import NListaManager from '@/pages/admin/nlista/NListaManager';
import OperationalManager from '@/pages/admin/operational/OperationalManager';
import ProductsListPage from '@/pages/products/ProductsListPage';
import ProductsManager from '@/pages/admin/products/ProductsManager';
import ProjectsManager from '@/pages/admin/projects/ProjectsManager';
import ProjectsPage from '@/pages/projects/ProjectsPage';
import ProjectDetailPage from '@/pages/projects/ProjectDetailPage';
import ArtistsManager from '@/pages/admin/artists/ArtistsManager';
import ModerationManager from '@/pages/admin/moderation/ModerationManager';
import SobrePage from '@/pages/sobre/SobrePage';
import SettingsManager from '@/pages/admin/settings/SettingsManager';
import ArtistsPage from '@/pages/artists/ArtistsPage';
import ArtistDetailPage from '@/pages/artists/ArtistDetailPage';
import RssManager from '@/pages/admin/rss/RssManager';
import ContactManager from '@/pages/admin/contact/ContactManager';
import DisplaysManager from '@/pages/admin/displays/DisplaysManager';
import DisplayPlayer from '@/pages/display/DisplayPlayer';
import AcessibilidadePage from '@/pages/acessibilidade/AcessibilidadePage';
import PrivacidadePage from '@/pages/privacidade/PrivacidadePage';
import TermosPage from '@/pages/termos/TermosPage';
import ContatoPage from '@/pages/contato/ContatoPage';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        {/* Dashboard do usuário comum (sem funções de admin) */}
        <Route path="/painel" element={<ProtectedRoute requireAdmin={false} />}>
          <Route element={<UserDashboard />}>
            <Route index element={<ProfileSection />} />
            <Route path="perfil" element={<ProfileSection />} />
            <Route path="comunidade" element={<ComunidadeSection />} />
            <Route path="comunidade/:topicId" element={<TopicDetail />} />
          </Route>
        </Route>
        <Route path="/eventos" element={<EventsListPage />} />
        <Route path="/eventos/:id" element={<EventDetailPage />} />
        <Route path="/produtos" element={<ProductsListPage />} />
        <Route path="/artistas" element={<ArtistsPage />} />
        <Route path="/artistas/:id" element={<ArtistDetailPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/projetos/:id" element={<ProjectDetailPage />} />
<Route path="/sobre" element={<SobrePage />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/galeria" element={<GalleryPage />} />
        <Route path="/galeria/:albumId" element={<GalleryInfinity />} />
        <Route path="/cultura" element={<div style={{ padding: '2rem' }}>Cultura — em breve</div>} />
        <Route path="/esportes" element={<div style={{ padding: '2rem' }}>Esportes — em breve</div>} />
        <Route path="/tecnologia" element={<div style={{ padding: '2rem' }}>Tecnologia — em breve</div>} />
        <Route path="/cadastrar-evento" element={<div style={{ padding: '2rem' }}>Cadastrar evento — em breve</div>} />
        <Route path="/cadastrar-projeto" element={<div style={{ padding: '2rem' }}>Cadastrar projeto — em breve</div>} />
        <Route path="/parceiros" element={<div style={{ padding: '2rem' }}>Parceiros — em breve</div>} />
        <Route path="/imprensa" element={<div style={{ padding: '2rem' }}>Imprensa — em breve</div>} />
        <Route path="/privacidade" element={<PrivacidadePage />} />
        <Route path="/termos" element={<TermosPage />} />
        <Route path="/acessibilidade" element={<AcessibilidadePage />} />
        <Route path="/display/:screenCode" element={<DisplayPlayer />} />

        {/* Rotas Administrativas Protegidas */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="events" element={<EventsManager />} />
            <Route path="financial" element={<FinancialManager />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="nlista" element={<NListaManager />} />
            <Route path="operational" element={<OperationalManager />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="artists" element={<ArtistsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="rss" element={<RssManager />} />
            <Route path="contact" element={<ContactManager />} />
            <Route path="moderation" element={<ModerationManager />} />
            <Route path="displays" element={<DisplaysManager />} />
            <Route path="settings" element={<SettingsManager />} />
          </Route>
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<div style={{ padding: '2rem' }}>404 - Página não encontrada</div>} />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
