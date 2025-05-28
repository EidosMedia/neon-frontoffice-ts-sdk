/*
 * Copyright © 2024 Eidosmedia S.p.a. All rights reserved.
 * Licensed under the terms of the Eidosmedia Software License Agreement.
 * See LICENSE file in project root for terms and conditions.
 */

export interface ISettings {
  neonFoUrl: string;
  frontOfficeServiceKey: string;
}

// Default settings
const settings: ISettings = {
  neonFoUrl: '',
  frontOfficeServiceKey: '',
};

export default settings;
