// @ts-check

/// <reference path="../../../types.d.ts" />

import React, { useState } from 'react';
import { TopList } from './top-list';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  blockers: DashboardBlockListEntry[] | undefined,
 *  blockers24: DashboardBlockListEntry[] | undefined,
 *  limit?: number
 * }} _
 */
export function TopBlockers({ blockers, blockers24, limit }) {
  return (
    <TopList
      className='top-blockers'
      header={(list) =>
        localise(`Top ${list.length || ''} Blockers`,
          { uk: `Топ ${list.length || ''} блок-берсеркерів` })}
      list={blockers}
      list24={blockers24}
      limit={limit} />
  );
}