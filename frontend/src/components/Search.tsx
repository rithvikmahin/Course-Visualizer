import React, { useEffect } from 'react'
import axios from 'axios'
import SearchBar from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import '../css/style.css'
import data from '../json/Data.json'

function Search() {
    useEffect(() => {
        const data = axios.get('http://localhost:5000/courses').then(result => console.log(result));
    });

    return (
        <SearchBar 
        options={data} 
        getOptionLabel={(data) => data.value}
        style={{width: 200}}
        renderInput={(params) => <TextField {...params} label='Enter a course name' margin='none' variant='filled'/>}/>
    )
}

export default Search;