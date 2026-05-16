type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="pagePlaceholder">
      <h1 className="pagePlaceholder__title">{title}</h1>
    </div>
  );
}
