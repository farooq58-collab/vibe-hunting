"use client";

/**
 * A deliberately small markdown renderer for generated documents.
 *
 * It builds React elements directly rather than setting innerHTML, so model
 * output can never inject markup into the page. It covers exactly what the GTM
 * documents use: headings, tables, lists, blockquotes, rules, bold/italic/code.
 */

function inline(text, keyPrefix = "i") {
  // Split on **bold**, *italic*/_italic_, and `code`, keeping the delimiters.
  const parts = String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g);
  return parts.filter(Boolean).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-neutral-100 px-1 py-0.5 text-[0.9em] font-mono text-blue-700 border border-neutral-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return (
        <em key={key} className="italic text-neutral-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

const isDivider = (line) => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes("-");

export default function Markdown({ children }) {
  const lines = String(children || "").split("\n");
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`l-${blocks.length}`}
        className={`my-3 space-y-1.5 pl-5 text-sm text-neutral-700 ${
          list.ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {list.items.map((item, i) => (
          <li key={i} className="pl-1 marker:text-neutral-400">
            {inline(item, `li-${i}`)}
          </li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Table: a header row followed by a |---|---| divider.
    if (trimmed.startsWith("|") && isDivider(lines[i + 1] || "")) {
      flushList();
      const head = splitRow(trimmed);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      i--;
      blocks.push(
        <div key={`t-${blocks.length}`} className="my-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b border-neutral-200">
                {head.map((cell, c) => (
                  <th key={c} className="px-3.5 py-2.5 font-semibold text-neutral-900">
                    {inline(cell, `th-${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {rows.map((row, r) => (
                <tr key={r} className="hover:bg-neutral-50/50">
                  {row.map((cell, c) => (
                    <td key={c} className="px-3.5 py-2.5 align-top text-neutral-700">
                      {inline(cell, `td-${r}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const sizes = {
        1: "mt-4 mb-4 text-2xl",
        2: "mt-7 mb-3 text-xl",
        3: "mt-6 mb-2 text-lg",
        4: "mt-5 mb-2 text-base",
      };
      const Tag = `h${Math.min(level, 6)}`;
      blocks.push(
        <Tag
          key={`h-${blocks.length}`}
          className={`font-heading font-bold text-neutral-900 ${sizes[level] || "mt-4 mb-2 text-sm"}`}
        >
          {inline(heading[2], `h-${blocks.length}`)}
        </Tag>
      );
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      blocks.push(<hr key={`r-${blocks.length}`} className="my-6 border-neutral-200" />);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushList();
      blocks.push(
        <blockquote
          key={`q-${blocks.length}`}
          className="my-3 border-l-4 border-blue-600 bg-blue-50/50 p-3 rounded-r-xl text-sm italic text-neutral-700"
        >
          {inline(trimmed.replace(/^>\s?/, ""), `q-${blocks.length}`)}
        </blockquote>
      );
      continue;
    }

    const bullet = trimmed.match(/^[-*+]\s+(.*)$/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
      continue;
    }

    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="my-3 text-sm leading-relaxed text-neutral-700">
        {inline(trimmed, `p-${blocks.length}`)}
      </p>
    );
  }

  flushList();
  return <div className="max-w-none">{blocks}</div>;
}
