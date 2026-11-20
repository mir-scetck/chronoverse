/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SettingsModal } from './components/SettingsModal';
import { EmbeddedBaghdadExhibit } from './components/exhibit/EmbeddedBaghdadExhibit';
import { AcademyShell } from './components/layout/AcademyShell';
import { ArtifactsPage } from './pages/ArtifactsPage';
import { DistrictLessonPage } from './pages/DistrictLessonPage';
import { Explore3DPage } from './pages/Explore3DPage';
import { HomePage } from './pages/HomePage';
import { JournalPage } from './pages/JournalPage';
import { PeoplePage } from './pages/PeoplePage';
import { TimelinePage } from './pages/TimelinePage';
import { VideosPage } from './pages/VideosPage';
import { AppProvider } from './stores/appStore';

function AppRoutes() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  if (isAutostart) {
    return <EmbeddedBaghdadExhibit autoStart fullViewport />;
  }

  return (
    <>
      <AcademyShell onOpenSettings={() => setSettingsOpen(true)}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/districts/:id" element={<DistrictLessonPage />} />
          <Route path="/artifacts" element={<ArtifactsPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/explore-3d" element={<Explore3DPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AcademyShell>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
