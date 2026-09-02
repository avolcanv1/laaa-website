import { useAcercaPage } from "../hooks/useAcercaPage";

export function AcercaPage() {
  const {
    paragraphs,
    contactEmail,
    instagramHandle,
    instagramUrl,
    addressLines,
    heroImageSrc,
    heroAlt,
  } = useAcercaPage();

  return (
    <div className="acercaPage">
      <div className="acercaPage__copy">
        <div className="acercaPage__body">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="acercaPage__paragraph">
              {paragraph}
            </p>
          ))}
        </div>
        <footer className="acercaPage__contact">
          <p className="acercaPage__contactLine">
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            {"  "}
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              {instagramHandle}
            </a>
          </p>
          <p className="acercaPage__contactLine">
            {addressLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < addressLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </footer>
      </div>
      <figure className="acercaPage__media">
        <img
          src={heroImageSrc}
          alt={heroAlt}
          className="acercaPage__img"
          decoding="async"
        />
      </figure>
    </div>
  );
}
