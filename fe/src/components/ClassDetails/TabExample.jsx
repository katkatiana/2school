import React, { useState } from 'react';
import { Table } from 'antd';
import { Checkbox } from 'antd';


const TabExample = () => {

  const [rowSelection, setRowSelection] = useState({});
  const columns = [
    {
      title: 'Nr',
      dataIndex: 'nr',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Missing',
      dataIndex: 'missing',
    },
  ];

  const handleRowSelectionChange = (enable) => {
    setRowSelection(enable ? {} : undefined);
  };

  const tableProps = {
    rowSelection,

  };

  const tableColumns = columns.map((item) => ({
    ...item  }));

    const onChange = (e) => {
      console.log(`checked = ${e.target.checked}`);
    };
    
    const data = [];
    for (let i = 1; i <= 10; i++) {
      data.push({
        key: i,
        name: 'John Brown',
        nr: Number(`${i}`),
        missing: <Checkbox onChange={onChange}></Checkbox> 
      });
    }


  return (
    
    <>
      <Table
        {...tableProps}
        columns={tableColumns}
        dataSource={data}
      />
    </>
  );
};

export default TabExample;