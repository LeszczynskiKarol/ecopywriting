// src/components/admin/AdminMessageList.tsx
'use client';
import { ColumnInstance, TableState, Column as ReactTableColumn, HeaderGroup, TableOptions } from 'react-table';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useTable,
  usePagination,
  useFilters,
  useSortBy,
  Row,
  Column,
  UseTableInstanceProps,
  UsePaginationInstanceProps,
  UseFiltersInstanceProps,
  UseSortByInstanceProps,
  UseSortByColumnProps
} from 'react-table';
import Link from 'next/link';
import { MessageCircle, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


type DefaultColumnType = Partial<ColumnInstance<Thread>> & {
  Filter: React.ComponentType<FilterProps<Thread>>;
};




type TableInstance = ReturnType<typeof useTable<Thread>> &
  UsePaginationInstanceProps<Thread> &
  UseFiltersInstanceProps<Thread> &
  UseSortByInstanceProps<Thread> & {
    state: TableState<Thread> & {
      pageIndex: number;
      pageSize: number;
    };
  };

type EnhancedHeaderGroup<D extends object> = HeaderGroup<D> & {
  getSortByToggleProps?: () => object;
  isSorted?: boolean;
  isSortedDesc?: boolean;
  canFilter?: boolean;
};

interface FilterProps<T extends object> {
  column: Column<T> & {
    filterValue: string;
    setFilter: (filterValue: string | undefined) => void;
  };
}

interface SelectFilterProps<T extends object> {
  column: Column<T> & {
    filterValue: string;
    setFilter: (filterValue: string | undefined) => void;
    preFilteredRows: Row<T>[];
    id: string;
  };
}

interface Thread {

  _id: string;

  subject: string;

  lastMessage?: {

    sender: { name: string };

    content: string;

    createdAt: string;

  };

  isOpen: boolean;

  messageCount: number;

  createdAt: string;

}




const DefaultColumnFilter = <T extends object>({
  column: { filterValue, setFilter },
}: FilterProps<T>) => {
  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined)
      }}
      placeholder={`Szukaj...`}
      className="p-1 border rounded"
    />
  )
}



const SelectColumnFilter = <T extends object>({
  column: { filterValue, setFilter, preFilteredRows, id },
}: SelectFilterProps<T>) => {
  const options = useMemo(() => {
    const options = new Set<string>()
    preFilteredRows.forEach((row) => {
      options.add(row.values[id] as string)
    })
    return [...options.values()]
  }, [id, preFilteredRows])



  return (
    <select
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined)
      }}
      className="p-1 border rounded"
    >
      <option value="">Wszystkie</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

type TableColumn = ReactTableColumn<Thread> &
  UseSortByColumnProps<Thread> & {
    getSortByToggleProps?: () => object;
  };




const AdminMessageList: React.FC = () => {

  const [error, setError] = useState<string | null>(null);
  const [totalThreads, setTotalThreads] = useState(0);

  const [threads, setThreads] = useState<Thread[]>([]);

  const [loading, setLoading] = useState(true);

  const { user, getToken } = useAuth();







  const fetchThreads = useCallback(async (pageIndex: number, pageSize: number) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }
      const response = await fetch(`/api/admin/threads?page=${pageIndex + 1}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setThreads(data.data);
        setTotalThreads(data.total); // Zakładając, że API zwraca całkowitą liczbę wątków

      } else {
        throw new Error(data.message || 'Failed to fetch threads');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania wątków:', error);
      setError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd');
    } finally {
      setLoading(false);
    }
  }, [getToken]);  // Dodaj getToken do zależności

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchThreads(0, 20);

      console.log('Joining admin room:', user.id);
    }


  }, [user, fetchThreads]);  // Dodaj fetchThreads do zależności

  const columns: TableColumn[] = useMemo(
    () => [
      {
        Header: 'Temat',
        accessor: 'subject',
        Cell: ({ row }: { row: Row<Thread> }) => (
          <Link href={`/admin/threads/${(row.original as Thread)._id}`} className="text-blue-500 hover:text-blue-700">
            {(row.original as Thread).subject}
          </Link>
        ),
        Filter: DefaultColumnFilter,
      },


      {

        Header: 'Status',

        accessor: 'isOpen',

        Cell: ({ value }: { value: boolean }) => (

          <span className={`px-2 py-1 rounded text-sm ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>

            {value ? 'Otwarty' : 'Zamknięty'}

          </span>

        ),

        Filter: SelectColumnFilter,

      },



      {

        Header: 'Ostatnia wiadomość',

        accessor: 'lastMessage.content',

        Cell: ({ row }: { row: Row<Thread> }) => (

          <div>

            <p className="truncate">{row.original.lastMessage?.content || 'Brak wiadomości'}</p>

            <p className="text-xs text-gray-500">

              {row.original.lastMessage

                ? `Od: ${row.original.lastMessage.sender.name}, ${new Date(row.original.lastMessage.createdAt).toLocaleString()}`

                : 'Brak ostatniej wiadomości'

              }

            </p>

          </div>

        ),

      },

      {

        Header: 'Liczba wiadomości',

        accessor: 'messageCount',

      },

      {

        Header: 'Data utworzenia',

        accessor: 'createdAt',

        Cell: ({ value }: { value: string }) => new Date(value).toLocaleString(),

      },

      {

        Header: 'Akcje',

        Cell: ({ row }: { row: Row<Thread> }) => (

          <Link href={`/admin/threads/${row.original._id}`} className="text-blue-500 hover:text-blue-700">

            <Eye size={18} />

          </Link>

        ),

      },

    ] as TableColumn[],
    []
  );



  const defaultColumn: DefaultColumnType = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const tableOptions: TableOptions<Thread> = useMemo(() => ({
    columns,
    data: threads,
    defaultColumn: defaultColumn as Partial<ColumnInstance<Thread>>,
    initialState: {
      pageIndex: 0,
      pageSize: 20
    } as Partial<TableState<Thread>>,
    pageCount: Math.ceil(totalThreads / 20),
    manualPagination: true,
  }), [columns, threads, defaultColumn, totalThreads]);


  const tableInstance = useTable<Thread>(
    tableOptions,
    useFilters,
    useSortBy,
    usePagination
  ) as TableInstance;




  useEffect(() => {
    if (user?.role === 'admin') {
      const { pageIndex, pageSize } = tableInstance.state;
      fetchThreads(pageIndex, pageSize);
    }
  }, [fetchThreads, user?.role, tableInstance.state]);


  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
  } = tableInstance;

  const { pageIndex, pageSize } = state as { pageIndex: number; pageSize: number };


  if (loading) {

    return <div className="text-center py-10">Ładowanie...</div>;

  }



  return (

    <div className="space-y-4">

      <h2 className="text-2xl font-bold">Zarządzanie wiadomościami</h2>



      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full bg-white border border-gray-300">
          <thead>
            {headerGroups.map(headerGroup => {
              const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map((column, columnIndex) => {
                    const enhancedColumn = column as EnhancedHeaderGroup<Thread>;
                    const headerProps = enhancedColumn.getHeaderProps(
                      enhancedColumn.getSortByToggleProps ? enhancedColumn.getSortByToggleProps() : undefined
                    );
                    const uniqueKey = headerProps.key || `header-${enhancedColumn.id || columnIndex}`;
                    return (
                      <React.Fragment key={uniqueKey}>
                        <th
                          {...headerProps}
                          className="p-2 bg-gray-100 border-b text-left"
                        >
                          {enhancedColumn.render('Header')}
                          <span>
                            {enhancedColumn.isSorted
                              ? enhancedColumn.isSortedDesc
                                ? <ArrowDown className="inline ml-1" size={14} />
                                : <ArrowUp className="inline ml-1" size={14} />
                              : ''}
                          </span>
                          <div>{enhancedColumn.canFilter ? enhancedColumn.render('Filter') : null}</div>
                        </th>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </thead>





          <tbody {...getTableBodyProps()}>

            {page.map((row: Row<Thread>) => {

              prepareRow(row);

              const { key: rowKey, ...rowProps } = row.getRowProps();

              return (

                <tr key={rowKey} {...rowProps} className="hover:bg-gray-50">

                  {row.cells.map(cell => {

                    const { key: cellKey, ...cellProps } = cell.getCellProps();

                    return (

                      <td key={cellKey} {...cellProps} className="p-2 border-b">

                        {cell.render('Cell')}

                      </td>

                    );

                  })}

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>



      <div className="flex items-center justify-between mt-4">

        <div>

          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="px-2 py-1 border rounded mr-1">

            {'<<'}

          </button>

          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-2 py-1 border rounded mr-1">

            {'<'}

          </button>

          <button onClick={() => nextPage()} disabled={!canNextPage} className="px-2 py-1 border rounded mr-1">

            {'>'}

          </button>

          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="px-2 py-1 border rounded">

            {'>>'}

          </button>

        </div>

        <span>

          Strona{' '}

          <strong>

            {pageIndex + 1} z {pageOptions.length}

          </strong>{' '}

        </span>

        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
          className="p-1 border rounded"
        >
          {[10, 20, 30, 40, 50].map(size => (
            <option key={size} value={size}>
              Pokaż {size}
            </option>
          ))}
        </select>

      </div>



      {threads.length === 0 && (

        <div className="text-center py-10">

          <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />

          <p className="text-gray-500">Brak wątków do wyświetlenia</p>

        </div>

      )}

    </div>

  );

};



export default AdminMessageList;