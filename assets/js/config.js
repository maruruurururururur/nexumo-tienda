const NEXUMO_CONFIG = {
  brand: "NEXUMO",
  supportEmail: "astrihub@gmail.com",
  currency: "EUR",

  apiBaseUrl: "",

  discord: {
    username: "maruuxz_",
  },

  discounts: {
    enabled: true,
    codes: {
      "FRE€100": { percent: 100, label: "100% GRATIS" },
    },
  },

  payments: {

    paypal: {
      enabled: true,

      clientId: "BAAg4hkuNNQVNt4gVhfPyS2GoaeDNnzYDeXoFPjddF7RNvECrWgRuMygob61ZmbWT3L-78gGo4_JnJWsVY",
      currency: "EUR",

      meLink: "https://paypal.me/AstriHub",
    },

    manual: {
      enabled: true,
      discord: "maruuxz_",
      iban: "",
      bizumPhone: "631 01 29 46",
    },
  }
};
