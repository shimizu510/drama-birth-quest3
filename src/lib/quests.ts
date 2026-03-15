export type QuestRecord = {
  id: string;
  title: string;
  synopsis: string;
  sourceLanguageCode: string;
  appDownloadURL: string | null;
  coverURL: string | null;
  authorDisplayName: string | null;
  episodeNumber: number | null;
  locationName: string | null;
  placeType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  webPagePath: string;
  webPageURL: string | null;
  raw: Record<string, unknown>;
};

type QuestModule = {
  default?: Record<string, unknown>;
};

export function getQuestId(filePath: string, data: Record<string, unknown>): string {
  const match = filePath.match(/\/([^/]+)\.json$/);
  return (typeof data.id === 'string' && data.id) || (match ? match[1] : 'unknown');
}

export function normalizeQuest(filePath: string, module: QuestModule | Record<string, unknown>): QuestRecord {
  const data = (module as QuestModule).default ?? module;
  const questId = getQuestId(filePath, data);

  const title =
    (typeof data.title === 'string' && data.title) ||
    getLocalizedText(data.titles) ||
    questId;
  const synopsis =
    (typeof data.synopsis === 'string' && data.synopsis) ||
    getLocalizedText(data.synopses) ||
    '';
  const webPagePath =
    (typeof data.webPagePath === 'string' && data.webPagePath) ||
    `/quests/${questId}/`;

  return {
    id: questId,
    title,
    synopsis,
    sourceLanguageCode:
      (typeof data.sourceLanguageCode === 'string' && data.sourceLanguageCode) || 'ja',
    appDownloadURL:
      typeof data.appDownloadURL === 'string' && data.appDownloadURL ? data.appDownloadURL : null,
    coverURL: typeof data.coverURL === 'string' && data.coverURL ? data.coverURL : null,
    authorDisplayName:
      typeof data.authorDisplayName === 'string' && data.authorDisplayName
        ? data.authorDisplayName
        : null,
    episodeNumber: typeof data.episodeNumber === 'number' ? data.episodeNumber : null,
    locationName:
      typeof data.locationName === 'string' && data.locationName ? data.locationName : null,
    placeType: typeof data.placeType === 'string' && data.placeType ? data.placeType : null,
    createdAt: typeof data.createdAt === 'string' && data.createdAt ? data.createdAt : null,
    updatedAt: typeof data.updatedAt === 'string' && data.updatedAt ? data.updatedAt : null,
    webPagePath,
    webPageURL: typeof data.webPageURL === 'string' && data.webPageURL ? data.webPageURL : null,
    raw: data,
  };
}

export function getLocalizedText(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const localized = value as Record<string, unknown>;
  const candidates = ['ja', 'en'];

  for (const key of candidates) {
    const text = localized[key];
    if (typeof text === 'string' && text) {
      return text;
    }
  }

  for (const text of Object.values(localized)) {
    if (typeof text === 'string' && text) {
      return text;
    }
  }

  return null;
}

export function buildAbsoluteUrl(path: string, site?: URL): string {
  if (!site) {
    return path;
  }

  return new URL(path, site).toString();
}

export function getQuestDescription(quest: QuestRecord): string {
  const base = quest.synopsis || `${quest.title} の公開ページです。`;
  return truncateText(
    `${base} 物語の概要を確認して、アプリからクエストを体験できます。`,
    120,
  );
}

export function getQuestSubtitle(quest: QuestRecord): string {
  const parts = [
    quest.authorDisplayName ? `作者 ${quest.authorDisplayName}` : null,
    quest.episodeNumber ? `第${quest.episodeNumber}話` : null,
    quest.locationName || quest.placeType,
  ].filter(Boolean);

  return parts.join(' / ');
}

export function isBrowserDisplayableImage(url: string | null): boolean {
  if (!url) {
    return false;
  }

  return !/\.hei[cf](\?|$)/i.test(url);
}

export function isOgImageSupported(url: string | null): boolean {
  return isBrowserDisplayableImage(url);
}

export function formatDateLabel(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
