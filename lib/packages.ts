export const PACKAGES = {
  starter: {
    label: "Starter",
    priceMonthly: 14900, // 149€ in Cent
    features: {
      upload_video: true,
      auto_music: false,
      auto_publish: false,
      analytics_basic: false,
      analytics_advanced: false,
      bulk_actions: false,
      multi_platform: false,
      priority_queue: false,
      white_label: false,
      api_access: false,
    },
    limits: {
      videos_per_month: 10,
      posts_total: 100,
      storage_gb: 5,
      platforms_count: 1,
    },
    upgradeTo: ["avant", "proship"],
  },

  avant: {
    label: "Avant",
    priceMonthly: 34900, // 349€ in Cent
    features: {
      upload_video: true,
      auto_music: true,
      auto_publish: true,
      analytics_basic: true,
      analytics_advanced: false,
      bulk_actions: true,
      multi_platform: true,
      priority_queue: false,
      white_label: false,
      api_access: false,
    },
    limits: {
      videos_per_month: 50,
      posts_total: 1000,
      storage_gb: 25,
      platforms_count: 3,
    },
    upgradeTo: ["proship"],
  },

  proship: {
    label: "ProShip",
    priceMonthly: 69900, // 699€ in Cent
    features: {
      upload_video: true,
      auto_music: true,
      auto_publish: true,
      analytics_basic: true,
      analytics_advanced: true,
      bulk_actions: true,
      multi_platform: true,
      priority_queue: true,
      white_label: true,
      api_access: true,
    },
    limits: {
      videos_per_month: -1, // unlimited
      posts_total: -1, // unlimited
      storage_gb: 100,
      platforms_count: -1, // unlimited
    },
    upgradeTo: [],
  },
} as const;

export type PackageKey = keyof typeof PACKAGES;
export type PackageFeature = keyof typeof PACKAGES.starter.features;
export type PackageLimit = keyof typeof PACKAGES.starter.limits;
