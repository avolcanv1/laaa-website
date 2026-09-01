import { Navigate, Route, Routes } from "react-router-dom";
import { SectionIndexMosaic } from "./components/SectionIndexMosaic";
import { AppLayout } from "./layout/AppLayout";
import { ExhibitionDetailPage } from "./pages/ExhibitionDetailPage";
import { HomePage } from "./pages/HomePage";
import { InvestigacionDetailPage } from "./pages/InvestigacionDetailPage";
import { AcercaPage } from "./pages/AcercaPage";
import { TiendaPage } from "./pages/TiendaPage";
import { TiendaProductPage } from "./pages/TiendaProductPage";
import { TalleresDetailPage } from "./pages/TalleresDetailPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="exposiciones">
          <Route index element={<SectionIndexMosaic section="exposiciones" />} />
          <Route path=":slug" element={<ExhibitionDetailPage />} />
        </Route>
        <Route path="investigacion">
          <Route index element={<SectionIndexMosaic section="investigacion" />} />
          <Route path=":slug" element={<InvestigacionDetailPage />} />
        </Route>
        <Route path="talleres">
          <Route index element={<SectionIndexMosaic section="talleres" />} />
          <Route path=":slug" element={<TalleresDetailPage />} />
        </Route>
        <Route path="acerca" element={<AcercaPage />} />
        <Route path="tienda">
          <Route index element={<TiendaPage />} />
          <Route path=":handle" element={<TiendaProductPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
