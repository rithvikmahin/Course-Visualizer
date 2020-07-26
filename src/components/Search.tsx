import React from 'react'
import SearchBar from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import '../css/style.css'
import data from '../json/Data.json'

function Search() {
    return (
        <SearchBar 
        options={data} 
        getOptionLabel={(data) => data.value}
        renderInput={(params) => <TextField {...params} label='Search' color='primary' variant='filled'/>}/>
    )
}

export default Search;