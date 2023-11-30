
import React, {useEffect, useState} from 'react';
import Axios from 'axios';

function App() {
  const [backendData, setBackendData] = useState()
  const getData = async() => {
    const id ='654850de943ca4ff18bb3718';
    const response =await Axios.get("http://localhost:5500/api/auth/get_exchange_by_id/"+ id);
    setBackendData(JSON.stringify(response.data.exchange));
    console.log(response.data.exchange);
  }

  useEffect (() =>{
    getData()
  }, []);
  
  return (
    
    <div>
      Exchange: {backendData}
    </div>
  );
}

export default App;
