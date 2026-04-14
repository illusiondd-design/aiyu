import { cleanAndFormatText } from "@/lib/formatters";

type GeneratedPlatformContent = {
  title: string;
  caption: string;
  hashtags: string[];
  cta: string;
};

type GeneratedResult = {
  ideaTitle: string;
  masterHook: string;
  companyId: string;
  rawInput: string;
  platforms: Record<string, GeneratedPlatformContent>;
};

type Props = {
  result: GeneratedResult | null;
};

export default function GeneratedOutput({ result }: Props) {
  if (!result) return null;

  return (
    <section className="mt-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Generierter Inhalt</h2>

      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Idee</p>
        <p className="mt-1 font-medium text-gray-900">{result.ideaTitle}</p>

        <p className="mt-3 text-sm text-gray-500">Master Hook</p>
        <p className="mt-1 text-gray-800">
          {cleanAndFormatText(result.masterHook)}
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(result.platforms).map(([platformId, content]) => (
          <div
            key={platformId}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold capitalize text-gray-900">{platformId}</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {content.title}
              </span>
            </div>

            <p className="mb-3 whitespace-pre-wrap text-sm text-gray-800">
              {cleanAndFormatText(content.caption)}
            </p>

            <div className="mb-2 flex flex-wrap gap-2">
              {content.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              CTA: {cleanAndFormatText(content.cta)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
