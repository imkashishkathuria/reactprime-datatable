import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import 'primereact/resources/themes/lara-dark-purple/theme.css';
import 'primereact/resources/primereact.min.css';
import { BiChevronDown } from 'react-icons/bi';

interface Post {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: null | string;
  date_start: number;
  date_end: number;
}

const App = () => {
  const [data, setData] = useState<Post[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const isMounted = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemIds, setItemIds] = useState<number[]>([]);
  const op = useRef<OverlayPanel>(null);
  const [inputRows, setInputRows] = useState<number>();

  useEffect(() => {
    const saved = localStorage.getItem("checkedItems");
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }

    const fetchData = async () => {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rows}`);
      const json = await res.json();
      setData(json.data);
      setTotalRecords(json.pagination.total);


    };

    fetchData();
  }, [currentPage, rows]);



  useEffect(() => {
    const all = itemIds.length > 0 && itemIds.every((id) => checkedItems[id.toString()]);
    setSelectAll(all);
  }, [itemIds, checkedItems]);


  useEffect(() => {
    const fetchIds = async () => {
      let page = 1;
      let hasMore = true;
      const ids: number[] = [];

      try {
        while (hasMore) {
          const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=100`);
          const result = await res.json();

          if (!Array.isArray(result.data)) {
            return;
          }

          const currentIds = result.data.map((item: any) => item.id);
          ids.push(...currentIds);

          hasMore = result.pagination.current_page < result.pagination.total_pages;
          page += 1;
          setItemIds(ids);
          // console.log(ids);
        }


      } catch (err) {
        console.error('Failed to fetch all IDs:', err);
      }
    };

    fetchIds();
  }, []);



  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem("checkedItems", JSON.stringify(checkedItems));
    } else {
      isMounted.current = true;
    }
  }, [checkedItems]);

  const handleCheckboxChange = (id: number, isChecked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: isChecked,
    }));
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      const updated: { [key: string]: boolean } = {};

      itemIds.forEach((id) => {
        updated[id.toString()] = isChecked;
      });
      setCheckedItems(updated);
    } else {
      setCheckedItems({});
    }


  };

  const onSubmitRows = () => {

    setRows(inputRows ?? 10);
    setCurrentPage(1);
    op.current?.hide();

  }

  const checkboxHeaderTemplate = () => (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <Checkbox
        inputId="selectAll"
        checked={selectAll}
        onChange={(e) => handleSelectAll(e.checked!)}
      />
      <div onClick={(e) => op.current?.toggle(e)}>
        <BiChevronDown size={30} />
      </div>

      <OverlayPanel ref={op}>
        <div className="flex flex-col p-2 gap-4">
          <div>
            <input type='number' placeholder='Select rows...' className='p-2 border-2 border-white' value={inputRows} onChange={(e) => setInputRows(Number(e.target.value))} />

          </div>
          <div className='flex justify-end'>
            <button onClick={onSubmitRows} className='p-3 cursor-pointer border-1 border-white rounded-[10px]'>Submit</button>
          </div>
        </div>
      </OverlayPanel>
    </div>
  );

  const checkboxBodyTemplate = (rowData: Post) => {
    const isChecked = checkedItems[rowData.id.toString()] || false;

    return (
      <Checkbox
        inputId={`checkbox-${rowData.id}`}
        checked={isChecked}
        onChange={(e) => handleCheckboxChange(rowData.id, e.checked!)}
      />


    );
  };

  const onPageChange = (e: any) => {
    setCurrentPage(e.page + 1);
    setRows(e.rows);
  }

  return (
    <div className="p-4">
      <DataTable
        value={data}
        tableStyle={{ minWidth: '60rem' }}
        paginator
        rows={rows}
        totalRecords={totalRecords}
        lazy
        first={(currentPage - 1) * rows}
        key={JSON.stringify(checkedItems) + currentPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        onPage={onPageChange}

      >

        <Column
          header={checkboxHeaderTemplate}
          body={checkboxBodyTemplate}
          style={{ width: '3rem' }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />

      </DataTable>
    </div>
  );
};

export default App;
