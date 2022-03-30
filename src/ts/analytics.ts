import { RegistrySpec } from "./iglu/Registries";

export const trackerAnalytics = (
  collector: string,
  pageUrl?: string,
  appId?: string
) => {};

export const repoAnalytics = (
  kind: RegistrySpec["kind"],
  name: string,
  uri?: URL
) => {};

export const landingUrl =
  "https://sophi.io/?" +
  [
    "utm_source=extension",
    "utm_medium=software",
    "utm_campaign=Sophi%20Data%20Inspector",
  ].join("&");
