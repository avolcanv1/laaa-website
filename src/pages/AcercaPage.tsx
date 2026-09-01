const ACERCA_PARAGRAPHS = [
  "Un espacio de investigación y desarrollo con sede en la Ciudad de México desde 2020, enfocado en la conceptualización de nuevos proyectos con artistas, arquitectxs e investigadores, así como en la preservación del patrimonio mediante la hibridación entre el uso de tecnologías contemporáneas y procesos vernaculares.",
  "En 2024 presentó una iniciativa de ley ante el Senado de la República para la creación del Repositorio de Artefactos Mesoamericanos (RAM), un archivo digital de acceso libre para la preservación y consulta educativa y científica de piezas arqueológicas.",
  "En 2025 inauguró LAAA Biblioteca PRAXIS, un proyecto de investigación orientado a democratizar el acceso a archivos y colecciones, iniciado con la biblioteca del Taller de Arquitectura PRAXIS de Agustín Hernández Navarro. Ese mismo año LAAA fue seleccionado en IN-PULSO CREATIVO, iniciativa del IFAL–Embajada de Francia en México que apoya a las industrias culturales y creativas mexicanas.",
  "Actualmente LAAA colabora con instituciones como el Museo Nacional de Antropología, el Museo del Templo Mayor, la Fundación Cultural Armella Spitalier, y el Archivo Agustín Hernández et al.",
] as const;

export function AcercaPage() {
  return (
    <div className="acercaPage">
      <div className="acercaPage__copy">
        <div className="acercaPage__body">
          {ACERCA_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="acercaPage__paragraph">
              {paragraph}
            </p>
          ))}
        </div>
        <footer className="acercaPage__contact">
          <p className="acercaPage__contactLine">
            <a href="mailto:info@laaa.mx">info@laaa.mx</a>
            {"  "}
            <a
              href="https://instagram.com/laaa_mx"
              target="_blank"
              rel="noreferrer"
            >
              @laaa_mx
            </a>
          </p>
          <p className="acercaPage__contactLine">
            Gob. Rafael Rebollar 93 Col. San Miguel Chapultepec
            <br />
            11580 Ciudad de México, México
          </p>
        </footer>
      </div>
      <figure className="acercaPage__media">
        <img
          src="/acerca/hero.jpg"
          alt="Biblioteca LAAA Biblioteca PRAXIS"
          className="acercaPage__img"
          decoding="async"
        />
      </figure>
    </div>
  );
}
