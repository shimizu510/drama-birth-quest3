export interface NormalizedPlace {
  id: string;
  slug: string;
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  phoneNumber: string | null;
  websiteURL: string | null;
  priceRange: string | null;
  openingHoursSummary: string | null;
  menuURL: string | null;
  roomSummary: string | null;
  experienceTags: string[];
  familyTags: string[];
  accessibilityTags: string[];
  budgetTags: string[];
  onsiteTags: string[];
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
    category: asString(source.category),
    phoneNumber: asString(source.phoneNumber),
    websiteURL: asString(source.websiteURL),
    priceRange: asString(source.priceRange),
    openingHoursSummary: asString(source.openingHoursSummary),
    menuURL: asString(source.menuURL),
    roomSummary: asString(source.roomSummary),
    experienceTags: Array.isArray(source.experienceTags) ? source.experienceTags.flatMap((value) => asString(value) ? [asString(value)!] : []) : [],
    familyTags: Array.isArray(source.familyTags) ? source.familyTags.flatMap((value) => asString(value) ? [asString(value)!] : []) : [],
    accessibilityTags: Array.isArray(source.accessibilityTags) ? source.accessibilityTags.flatMap((value) => asString(value) ? [asString(value)!] : []) : [],
    budgetTags: Array.isArray(source.budgetTags) ? source.budgetTags.flatMap((value) => asString(value) ? [asString(value)!] : []) : [],
    onsiteTags: Array.isArray(source.onsiteTags) ? source.onsiteTags.flatMap((value) => asString(value) ? [asString(value)!] : []) : [],
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
  const extras = [
    place.category ? `カテゴリは${place.category}` : null,
    place.priceRange ? `価格帯は${place.priceRange}` : null,
    place.openingHoursSummary ? `営業時間は${place.openingHoursSummary}` : null,
    place.experienceTags.length > 0 ? `特徴は${place.experienceTags.join('・')}` : null,
  ].filter((value): value is string => !!value);

  return `${place.title} の場所ページです。${place.address}。${stats.join('、')}を掲載しています。${extras.join('。')}`;
}

export function formatPlaceRating(ratingAverage: number): string {
  return ratingAverage > 0 ? ratingAverage.toFixed(1) : '未評価';
}

export function shouldIndexPlace(place: NormalizedPlace): boolean {
  return place.questCount > 0 || place.photoCount > 0 || place.commentCount > 0;
}

export function tagLabel(tag: string): string {
  const map: Record<string, string> = {
    family: '子連れ',
    barrier_free: 'バリアフリー',
    budget: '低予算',
    onsite_strategy: '現地攻略',
    kids_friendly: 'キッズ向け',
    step_light_possible: '段差少なめ候補',
    rest_space_possible: '休憩しやすい候補',
    free_or_public: '無料・公共寄り',
    low_cost: '低コスト',
    short_stay_ok: '短時間立ち寄り向き',
    rainy_day_ok: '雨の日向き',
    walkable: '歩いて回りやすい',
  };
  return map[tag] ?? tag;
}
