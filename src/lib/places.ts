export interface NormalizedPlace {
  id: string;
  slug: string;
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  webPagePath: string;
  webPageURL: string | null;
  coverImageURL: string | null;
  questCount: number;
  photoCount: number;
  commentCount: number;
  ratingAverage: number;
  recentComments: {
    text: string;
    authorDisplayName: string | null;
    rating: number;
    createdAt: string | null;
  }[];
  createdAt: string | null;
  updatedAt: string | null;
  createdByName: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function withTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

export function normalizePlace(filePath: string, module: unknown): NormalizedPlace {
  const source = asRecord(asRecord(module).default ?? module);
  const slug = asString(source.slug) ?? filePath.split('/').pop()?.replace(/\.json$/, '') ?? 'place';

  return {
    id: asString(source.id) ?? slug,
    slug,
    title: asString(source.title) ?? 'Untitled Place',
    address: asString(source.address) ?? '住所情報なし',
    latitude: asNumber(source.latitude),
    longitude: asNumber(source.longitude),
    status: asString(source.status),
    webPagePath: withTrailingSlash(asString(source.webPagePath) ?? `/places/${slug}`),
    webPageURL: asString(source.webPageURL),
    coverImageURL: asString(source.coverImageURL),
    questCount: asNumber(source.questCount) ?? 0,
    photoCount: asNumber(source.photoCount) ?? 0,
    commentCount: asNumber(source.commentCount) ?? 0,
    ratingAverage: asNumber(source.ratingAverage) ?? 0,
    recentComments: Array.isArray(source.recentComments)
      ? source.recentComments.flatMap((value) => {
          const item = asRecord(value);
          const text = asString(item.text);
          if (!text) {
            return [];
          }
          return [{
            text,
            authorDisplayName: asString(item.authorDisplayName),
            rating: asNumber(item.rating) ?? 0,
            createdAt: asString(item.createdAt),
          }];
        })
      : [],
    createdAt: asString(source.createdAt),
    updatedAt: asString(source.updatedAt),
    createdByName: asString(source.createdByName),
  };
}

export function getPlaceDescription(place: NormalizedPlace): string {
  const stats = [
    `${place.questCount}件の関連クエスト`,
    `${place.photoCount}件の写真`,
    `${place.commentCount}件のコメント`,
  ];

  return `${place.title} の場所ページです。${place.address}。${stats.join('、')}を掲載しています。`;
}

export function formatPlaceRating(ratingAverage: number): string {
  return ratingAverage > 0 ? ratingAverage.toFixed(1) : '未評価';
}
