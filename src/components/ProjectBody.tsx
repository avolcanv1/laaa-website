import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { formatBodyTypography } from "../lib/typographyText";
import type { PortableTextBlock } from "../lib/portableText";

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    artLabel: ({ children }) => (
      <span className="exhibitionDetail__artLabel">{children}</span>
    ),
    h2: ({ children }) => <h2 className="exhibitionDetail__bodyHeading">{children}</h2>,
    blockquote: ({ children }) => (
      <blockquote className="exhibitionDetail__bodyQuote">{children}</blockquote>
    ),
  },
  marks: {
    dateUnivers: ({ children }) => (
      <span className="exhibitionDetail__artLabelDate">{children}</span>
    ),
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul className="exhibitionDetail__bodyList">{children}</ul>,
    number: ({ children }) => <ol className="exhibitionDetail__bodyList">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
};

type ProjectBodyProps = {
  body: string;
  bodyBlocks?: PortableTextBlock[] | null;
};

export function ProjectBody({ body, bodyBlocks }: ProjectBodyProps) {
  if (bodyBlocks?.length) {
    return (
      <div className="exhibitionDetail__body">
        <PortableText value={bodyBlocks} components={portableTextComponents} />
      </div>
    );
  }

  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (paragraphs.length <= 1) {
    return (
      <p className="exhibitionDetail__body">
        {formatBodyTypography(body)}
      </p>
    );
  }

  return (
    <div className="exhibitionDetail__body">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{formatBodyTypography(paragraph)}</p>
      ))}
    </div>
  );
}
