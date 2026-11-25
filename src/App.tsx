import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { SectionIndexMosaic } from "./components/SectionIndexMosaic";
import { AppLayout } from "./layout/AppLayout";
import { ExhibitionDetailPage } from "./pages/ExhibitionDetailPage";
import { HomePage } from "./pages/HomePage";
import { InvestigacionDetailPage } from "./pages/InvestigacionDetailPage";
import { AcercaPage } from "./pages/AcercaPage";
import { TalleresDetailPage } from "./pages/TalleresDetailPage";
import { SECTION_PATHS } from "./nav/sectionLabels";

/** Manda una ficha vieja a la misma ficha en su ruta nueva. */
function RedirectSlug({ to }: { to: string }) {
  const { slug = "" } = useParams();
  return <Navigate to={slug ? `${to}/${slug}` : to} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />

        <Route path={SECTION_PATHS.exposiciones.slice(1)}>
          <Route index element={<SectionIndexMosaic section="exposiciones" />} />
          <Route path=":slug" element={<ExhibitionDetailPage />} />
        </Route>
        <Route path={SECTION_PATHS.investigacion.slice(1)}>
          <Route index element={<SectionIndexMosaic section="investigacion" />} />
          <Route path=":slug" element={<InvestigacionDetailPage />} />
        </Route>
        <Route path={SECTION_PATHS.talleres.slice(1)}>
          <Route index element={<SectionIndexMosaic section="talleres" />} />
          <Route path=":slug" element={<TalleresDetailPage />} />
        </Route>
        <Route path={SECTION_PATHS.acerca.slice(1)} element={<AcercaPage />} />

        {/*
          Rutas viejas. /exposiciones y /acerca ya no se usan, así que
          cualquier liga compartida antes sigue llegando a su destino.

          /investigacion no aparece aquí a propósito: ahora es la ruta
          nueva de Investigación, así que no puede redirigir a
          Colaboraciones sin romperse.
        */}
        <Route
          path="exposiciones"
          element={<Navigate to={SECTION_PATHS.exposiciones} replace />}
        />
        <Route
          path="exposiciones/:slug"
          element={<RedirectSlug to={SECTION_PATHS.exposiciones} />}
        />
        <Route
          path="acerca"
          element={<Navigate to={SECTION_PATHS.acerca} replace />}
        />

        <Route path="tienda" element={<Navigate to="/" replace />} />
        <Route path="tienda/:handle" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
