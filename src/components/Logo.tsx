import { Link } from "react-router-dom";

type LogoProps = {
  onNavigate?: () => void;
  /** Top bar: same LAAA letter weights as desktop, without tagline. */
  markOnly?: boolean;
};

export function Logo({ onNavigate, markOnly }: LogoProps) {
  const mark = (
    <Link
      to="/"
      className="logoBlock__mark"
      aria-label="LAAA — inicio"
      onClick={onNavigate}
    >
      <span className="logoBlock__letter logoBlock__letter--m">L</span>
      <span className="logoBlock__letter">A</span>
      <span className="logoBlock__letter logoBlock__letter--l">A</span>
      <span className="logoBlock__letter logoBlock__letter--t">A</span>
    </Link>
  );

  if (markOnly) {
    return <div className="logoBlock logoBlock--markOnly">{mark}</div>;
  }

  return (
    <div className="logoBlock">
      {mark}
      <Link to="/" className="logoBlock__tagline" onClick={onNavigate}>
        Laboratorio de Arte,
        <br />
        Arquitectura y Arqueología
      </Link>
    </div>
  );
}
