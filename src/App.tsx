import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

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
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const isMounted = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("checkedItems");
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }

    const fetchData = async () => {
      const res = await fetch("https://api.artic.edu/api/v1/artworks?page=1");
      const json = await res.json();
      setData(json.data);
    };

    fetchData();
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
    const updated: { [key: string]: boolean } = {};
    data.forEach((item) => {
      updated[item.id.toString()] = isChecked;
    });
    setCheckedItems(updated);
  };

  const allSelected = data.length > 0 && data.every((item) => checkedItems[item.id.toString()]);

  const checkboxHeaderTemplate = () => (
    <Checkbox
      inputId="selectAll"
      checked={allSelected}
      onChange={(e) => handleSelectAll(e.checked!)}
    />
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

  return (
    <div className="p-4">
      <DataTable
        value={data}
        tableStyle={{ minWidth: '60rem' }}
        paginator
        rows={5}
        key={JSON.stringify(checkedItems)}
        rowsPerPageOptions={[5, 10, 25, 50]}
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
