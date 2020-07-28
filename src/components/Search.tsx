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
        style={{width: 200}}
        renderInput={(params) => <TextField {...params} label='Enter a course name' margin='none' variant='filled'/>}/>
    )
}

export default Search;