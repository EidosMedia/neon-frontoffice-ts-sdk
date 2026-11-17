/*
 * Copyright © 2024 Eidosmedia S.p.a. All rights reserved.
 * Licensed under the terms of the Eidosmedia Software License Agreement.
 * See LICENSE file in project root for terms and conditions.
 */

import { DEFAULT_SITE_CONFIG_REDACTION, type SiteConfigRedaction } from '../utilities/siteConfig';

export interface ISettings {
  neonFoUrl: string;
  frontOfficeServiceKey: string;
  siteConfigRedaction: SiteConfigRedaction;
}

// Default settings
const settings: ISettings = {
  neonFoUrl: '',
  frontOfficeServiceKey: '',
  siteConfigRedaction: DEFAULT_SITE_CONFIG_REDACTION,
};

export default settings;
