/* eslint-disable react/jsx-key */

// React
import { Suspense } from 'react';

// Server Components
import SettingsBar from '../components/SettingsBar/SettingsBar.server';

// Client Components
import Page from '../components/page.client';
import ExpandOverlay from '../components/Cells/ExpandOverlay.client';

// Utils
import config from '../config';
import { useData, updateExpiration } from '../lib/useData';
import Skeletons from '../components/skeletons';
import hashQuery from '../lib/hashQuery';
import fetchTable from '../lib/fetchTable';
import fetchStatus from '../lib/fetchStatus';
import { EMPTY_TABLE } from '../stubs';
import { columnTypeMap } from '../lib/makeComponentMap';
import FooterRow from '../components/FooterRow.server';
import Imports from '../components/SettingsBar/Imports.client';
import ClientContext from '../components/Cells/ClientContext.client';
// If not imported here, the import in page.client.js will fail
import { StyledEngineProvider } from '@mui/material';

const Root = ({ query, matrices, expiration }) => {
    /* eslint-disable no-unused-vars */
    updateExpiration(expiration);
    const { data: table, tableError } = useData(
        `query-${hashQuery({ query })}`,
        () => fetchTable(query),
    );

    const status = useData(
        `status`,
        () => fetchStatus(),
    );

    const { data: allColumns, colError } = useData(
        `query-${hashQuery({
            query: {
                ...query,
                select: '*',
                limit: 1,
            },
        })}`,
        () => fetchTable(query),
    );

    /* eslint-enable no-unused-vars */
    const { dgid } = query;
    const { columnTypes, columns, rows, total } = table ?? EMPTY_TABLE;

    const columnOptions = allColumns
        ? allColumns?.columns?.filter((col) => !col.endsWith('--metadata'))
        : [];
    // TODO Clean this up with .filter()
    const filteredColumns = [];
    const filteredColumnTypes = [];
    columns.forEach((columnName, idx) => {
        if (!columnName.endsWith('--metadata')) {
            filteredColumnTypes.push(columnTypes[idx]);
            filteredColumns.push(columnName);
        }
    });

    // TODO Clean up
    const rowClass = !!query?.groupBy && query?.groupBy ? 'row-group' : 'row';
    const colClass =
        !!query?.groupBy && query?.groupBy
            ? 'column-group cell-group'
            : 'column cell';
    const headerClass = colClass.includes('group') ? 'column-group' : 'column';
    return (
        <Page>
            <Suspense fallback={<Skeletons />}>
                <Imports />
            </Suspense>
            <Suspense fallback={<Skeletons />}>
                <SettingsBar
                    query={query}
                    matrices={matrices}
                    columns={filteredColumns}
                    options={columnOptions}
                    status={status}
                />
            </Suspense>
            <Suspense fallback={<Skeletons />}>
                <ClientContext apiUrl={config.apiUrl} otherUrl={config.apiUrl} isColab={config.isColab} >
                    <div className="table-root">
                        <div id="header-row" className={`${rowClass}`}>
                            {filteredColumns.map((col) => (
                                <div className={headerClass} title={col}>
                                    {col}
                                </div>
                            ))}
                        </div>
                        {rows.map((row, ridx) => (
                            <div className={`${rowClass}`} key={`row-${ridx}`}>
                                {filteredColumns.slice(0, 5).map((col, idx) => (
                                    <div
                                        className={`${colClass}`}
                                        key={`${ridx}-${idx}`}
                                    >
                                        {!!query?.groupBy && query?.groupBy !== col
                                            ? columnTypeMap[
                                                  filteredColumnTypes[idx]
                                              ].groupComponent({
                                                  value: row[col],
                                                  dgid,
                                                  row,
                                                  col,
                                              })
                                            : columnTypeMap[
                                                  filteredColumnTypes[idx]
                                              ].component({
                                                  value: row[col],
                                                  dgid,
                                                  row,
                                                  col,
                                              })}
                                        <ExpandOverlay>
                                            {!!query?.groupBy && query?.groupBy !== col
                                                ? columnTypeMap[
                                                      filteredColumnTypes[idx]
                                                  ].expandedGroupComponent({
                                                      value: row[col],
                                                      dgid,
                                                      row,
                                                      col,
                                                      query,
                                                  })
                                                : columnTypeMap[
                                                      filteredColumnTypes[idx]
                                                  ].expandedComponent({
                                                      value: row[col],
                                                      dgid,
                                                      row,
                                                      col,
                                                  })}
                                        </ExpandOverlay>
                                    </div>
                                ))}

                                {filteredColumns.length > 5 &&
                                    filteredColumns.slice(5).map((col, idx) => (
                                        <div
                                            className={`${colClass}`}
                                            key={`${ridx}-${idx + 5}`}
                                        >
                                            {!!query?.groupBy && query?.groupBy !== col
                                                ? columnTypeMap[
                                                      filteredColumnTypes[
                                                          idx + 5
                                                      ]
                                                  ].groupComponent({
                                                      value: row[col],
                                                      dgid,
                                                      row,
                                                      col,
                                                      defer: true,
                                                  })
                                                : columnTypeMap[
                                                      filteredColumnTypes[
                                                          idx + 5
                                                      ]
                                                  ].component({
                                                      value: row[col],
                                                      dgid,
                                                      row,
                                                      col,
                                                  })}
                                            <ExpandOverlay>
                                                {!!query?.groupBy && query?.groupBy !== col
                                                    ? columnTypeMap[
                                                          filteredColumnTypes[
                                                              idx + 5
                                                          ]
                                                      ].expandedGroupComponent({
                                                          value: row[col],
                                                          dgid,
                                                          row,
                                                          col,
                                                          query,
                                                          defer: true,
                                                      })
                                                    : columnTypeMap[
                                                          filteredColumnTypes[
                                                              idx + 5
                                                          ]
                                                      ].expandedComponent({
                                                          value: row[col],
                                                          dgid,
                                                          row,
                                                          col,
                                                      })}
                                            </ExpandOverlay>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </ClientContext>
            </Suspense>
            <Suspense fallback={<Skeletons />}>
                <FooterRow query={query} total={total} />
            </Suspense>
        </Page>
    );
};

// The Next.js server knows to look for this function and apply it to the index.server page
export const getServerSideProps = async (context) => {
    const data = await fetch(`${config.apiUrl}list`);
    const matrices = await data.json();

    const props = {
        props: {
            matrices: matrices || [],
            query: {
                dgid: context.query?.datagrid || null,
                whereExpr: context.query?.filter || null,
                limit: 10,
            },
            expiration: null
        }, // will be passed to the page component as props
    };

    return props;
};

export default Root;

