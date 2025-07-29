

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import React, { useState, useEffect } from 'react';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface Post {
  title: string,
  place_of_origin: string,
  artist_display: string,
  inscriptions: null | string,
  date_start: number,
  date_end: number

}

const App = () => {
  const [data, setData] = useState<Post[]>([]);
  

  const columns = [
    {field: 'title', header: 'Title'},
    {field: 'place_of_origin', header: 'Place_of_origin'},
    {field: 'artist_display', header: 'Artist_display'},
    {field: 'inscriptions' , header: 'Inscriptions'},
    {field: 'date_start', header: 'Date_start'},
    {field: 'date_end', header: 'Date_end'},
  ]

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://api.artic.edu/api/v1/artworks?page=1");
      const json = await res.json();
      const data: Post[] = await json.data;
      console.log(data);
      setData(data);

    }
    fetchData();

  }, []);
  return (
    <div className='p-10'>

      <DataTable value={data} tableStyle={{ minWidth: '50rem' }} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}>
                {columns.map((col, i) => (
                    <Column key={col.field} field={col.field} header={col.header} />
                ))}
            </DataTable>

    </div>
  )
}

export default App
