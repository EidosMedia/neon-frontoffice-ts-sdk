export enum ViewStatus {
  LIVE = 'LIVE',
  PREVIEW = 'PREVIEW',
}

export const SITE_VIEW_STATUS = {
  [ViewStatus.LIVE]: 'live',
  [ViewStatus.PREVIEW]: 'preview',
} as const;

export type SiteViewStatus = (typeof SITE_VIEW_STATUS)[ViewStatus];

export const normalizeViewStatus = (
  value?: string | null,
  fallback: ViewStatus = ViewStatus.LIVE,
): ViewStatus => {
  const upperValue = (value ?? '').toUpperCase();
  if (upperValue === ViewStatus.LIVE || upperValue === ViewStatus.PREVIEW) {
    return upperValue;
  }

  return fallback;
};

export const parseViewStatus = (value?: string | null): ViewStatus | undefined => {
  const upperValue = (value ?? '').toUpperCase();
  if (upperValue === ViewStatus.LIVE || upperValue === ViewStatus.PREVIEW) {
    return upperValue;
  }

  return undefined;
};

export const toSiteViewStatus = (value: ViewStatus): SiteViewStatus => {
  return SITE_VIEW_STATUS[value];
};

export const getSwitchTargetViewStatus = (value: ViewStatus): ViewStatus => {
  return value === ViewStatus.LIVE ? ViewStatus.PREVIEW : ViewStatus.LIVE;
};