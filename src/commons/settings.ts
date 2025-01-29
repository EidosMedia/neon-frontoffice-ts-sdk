/*
 * Copyright © 2024 Eidosmedia S.p.a. All rights reserved.
 * Licensed under the terms of the Eidosmedia Software License Agreement.
 * See LICENSE file in project root for terms and conditions.
 */

export interface ISettings {
  neonFeUrl: string;
  frontOfficeServiceKey: string;
}

// Default settings
const settings: ISettings = {
  neonFeUrl: '',
  frontOfficeServiceKey: '',
};

export default settings;
