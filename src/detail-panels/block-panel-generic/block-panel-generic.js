// @ts-check

import React, { useState } from 'react';

import { TableChart, TableRows } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import {
  isPromise,
  resolveHandleOrDID,
  useSingleBlocklist,
  unwrapShortHandle,
} from '../../api';
import { SearchHeaderDebounced } from '../history/search-header';
import { ListView } from './list-view';
import { TableView } from './table-view';

import './block-panel-generic.css';
import { localise } from '../../localisation';

/**
 * @this {never}
 * @param {{
 *  className?: string,
 *  useBlocklistQuery: typeof useSingleBlocklist,
 *  account: AccountInfo | { shortHandle: String, loading: true },
 *  header?: React.ReactNode | ((args: { count, blocklist: any[] }) => React.ReactNode)
 * }} _
 */
export function BlockPanelGeneric({
  className,
  useBlocklistQuery,
  account,
  header,
}) {
  const { data, fetchNextPage, hasNextPage, isLoading } = useBlocklistQuery(
    unwrapShortHandle(account.shortHandle)
  );

  const blocklistPages = data?.pages;

  const [tableView, setTableView] = React.useState(false);

  const blocklist = blocklistPages?.flatMap((page) => {
    return page.blocklist;
  });
  const count = blocklistPages?.[0]?.count;

  // const [searchParams, setSearchParams] = useSearchParams();
  // const [tick, setTick] = useState(0);
  // const search = (searchParams.get("q") || "").trim();

  // const [showSearch, setShowSearch] = useState(!!search);

  // const filteredBlocklist =
  //   !search || !blocklist
  //     ? blocklist || []
  //     : matchSearch(blocklist, search, () => setTick(tick + 1));

  return (
    <div
      className={'block-panel-generic ' + (className || '')}
      style={{
        backgroundColor: '#fefafa',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%',
      }}
    >
      {/* <SearchHeaderDebounced
        style={showSearch ? undefined : { display: 'none' }}
        label={' ' + localise('Search', {uk: 'Пошук'})}
        setQ /> */}
      <PanelHeader
        count={count}
        blocklist={blocklist}
        header={header}
        // this actually hides the search icon?
        showSearch={true}
        // setShowSearch={setShowSearch}
        // onShowSearch={() => setShowSearch(true)}
        onToggleView={() => setTableView(!tableView)}
        tableView={tableView}
      />
      {isLoading ? (
        <p style={{ padding: '0.5em', opacity: '0.5' }}>Loading...</p>
      ) : tableView ? (
        <TableView account={account} blocklist={blocklist} />
      ) : (
        <ListView account={account} blocklist={blocklist} />
      )}
    </div>
  );
}

class PanelHeader extends React.Component {
  direction = +1;

  render() {
    let count = this.props.count;
    if (typeof this.props.count !== 'number') {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.forceUpdate(), 10);
      count = this.state?.count || 0;
      if (!this.state) this.state = { count: 0 };
    }

    const { blocklist, header } = this.props;

    return (
      <h3 className={'blocking-panel-header' + (typeof this.props.count === 'number' ? '' : ' blocking-panel-header-loading')}>
        {typeof header === 'function' ?
          header({ count, blocklist }) :
          header
        }

        <span className='panel-toggles'>
          {
            this.props.showSearch ? undefined :
              <Button size='small' className='panel-show-search' onClick={this.props.setShowSearch}><SearchIcon /></Button>
          }
          <Button
            title={localise('Toggle table view', {uk: 'Перемкнути вигляд таблиці/списку'})}
            variant='contained' size='small' className='panel-toggle-table' onClick={this.props.onToggleView}>
            {this.props.tableView ?  <TableRows /> : <TableChart />}
          </Button>
        </span>
      </h3>
    );
  }

  forceUpdate = () => {
    let count = Math.max(0, (this.state?.count || 0) + this.direction);
    this.setState({ count });
    if (count === 0 || (count < 30 && this.direction < 0 && Math.random() > 0.9)) this.direction = +1;
    else if (count > 600 && this.direction > 0 && Math.random() > 0.99)
      this.direction = -1;
  };
}

/**
 * @param {BlockedByRecord[]} blocklist
 * @param {string} search
 * @param {() => void} [redraw]
 */
function matchSearch(blocklist, search, redraw) {
  const searchLowercase = search.toLowerCase();
  const filtered = blocklist.filter(entry => {
    if (entry.handle.toLowerCase().includes(searchLowercase)) return true;

    const accountOrPromise = resolveHandleOrDID(entry.handle);
    if (isPromise(accountOrPromise)) {
      accountOrPromise.then(redraw);
      return false;
    }

    if ((accountOrPromise.displayName || '').toLowerCase().includes(searchLowercase)) return true;
  });
  return filtered;
}
