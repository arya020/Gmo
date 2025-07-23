import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useRef, useState } from 'react';
import { Paginator } from 'primereact/paginator';
import 'primeicons/primeicons.css';
import { OverlayPanel } from 'primereact/overlaypanel';
import './Table.css';
        
function Table () {

    const [page, setPage] = useState(1);
    type row = { id: number, title: string,  place_of_origin: number, artist_display: string, inscription: string, date_start: number, date_end: number };
    const [rowsData, setRowsData] = useState<row[]>([]);
    const [selectedRows, setSelectedRows] = useState<row[]>([]);
    const [selectedCurrRows, setSelectedCurrRows] = useState<Map<number, row[]>>(new Map());
    const opRef = useRef<OverlayPanel>(null);
    let numOfSelect = 0;

    useEffect(() => {
        getData();
    }, [page]);

    const getData = async () : Promise<row[]>  => await fetch('https://api.artic.edu/api/v1/artworks?page='+page)
        .then(response => response.json())
        .then( result => {
            //console.log(result);
            setRowsData(result.data);
            return result.data;
        })  
        .catch(error => {
            console.error('Error fetching data:', error);
            return [];
        });

    const onPageChange = (event: any) => {
        console.log('Page changed to:', event.page);
        setPage(event.page+1);
    };

    return (
        <>
        { rowsData && rowsData.length === 0 ?
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', marginTop: '25%', marginLeft:'50%' }}></i>
        :
        <> 
        <DataTable className='tab' value={rowsData} rows={rowsData.length} selectionMode='checkbox' selection={selectedCurrRows.get(page) || []} onSelectionChange={(e) => {
                
                
                const currSelectedRows = e.value;
                const prevSelectedRows = selectedRows.filter(row => rowsData.some(data => data.id === row.id));
                const deSelectedRows = prevSelectedRows.filter(row => !currSelectedRows.some(selected => selected.id === row.id));
                const newGlobalSelectedRows = selectedRows.filter(row => !deSelectedRows.some(selected => selected.id === row.id));
                const newSelectedRows = currSelectedRows.filter(row => !newGlobalSelectedRows.some(selected => selected.id === row.id));
                setSelectedCurrRows(prev => {
                    const newMap = new Map(prev);
                    newMap.set(page, currSelectedRows);
                    return newMap;
                });
                setSelectedRows([...newGlobalSelectedRows, ...newSelectedRows]);

                console.log('Selected Rows:', selectedRows);
            }} dataKey="id" stripedRows>
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="id" header={
            <>
                <button
                className="p-button p-button-text"
                onClick={(e) => opRef.current?.toggle(e)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ID <i className="pi pi-angle-down" />
                </button>
                <OverlayPanel ref={opRef}>
                <input type="number" placeholder="Select rows..." className="p-inputtext p-component" onChange={(e) => {
                    numOfSelect = parseInt(e.target.value);
                }} />
                <button className="Submit" onClick={() => 
                    {
                        const getSelections = rowsData.slice(0, numOfSelect);
                        setSelectedCurrRows(prev => {
                            const newMap = new Map(prev);
                            newMap.set(page, getSelections);
                            return newMap;
                        });
                        const newSelectedRows = getSelections.filter(row => !selectedRows.some(selected => selected.id === row.id));
                        setSelectedRows(prev => [...prev, ...newSelectedRows]);
                        console.log(selectedRows);
                        opRef.current?.hide();
                    }

                }>Select</button>
                </OverlayPanel>
            </>
            } /> 
            <Column field="title" header="Title" />
            <Column field="place_of_origin" header="Place of Origin" />  
            <Column field="artist_display" header="Artist Display" />
            <Column field="inscription" header="Inscription" />
            <Column field="date_start" header="Start Date" />
            <Column field="date_end" header="End Date" />
        </DataTable>
        <Paginator first={(page - 1) * 12} rows={rowsData.length} totalRecords={1000} onPageChange={onPageChange} />
        </> }
        </>
    );
}

export default Table;
        
