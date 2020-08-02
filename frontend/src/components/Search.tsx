import React, { useState, useEffect } from 'react'
import SearchBar from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import { withStyles } from "@material-ui/core";
import '../css/style.css'
import data from '../json/Data.json'

const styles = (theme: any) => ({
    textField: {
      marginLeft: theme.spacing.unit * 3,
      marginBottom: '0px',
    },
    label: {
      '&$focused': {
        color: '#4A90E2'
      },
    },
    focused: {},
    outlinedInput: {
      '&$focused $notchedOutline': {
        border: '1px solid #4A90E2'
      },
    },
    notchedOutline: {},
  })

function Search(data: any) {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchBar, setSearchBar] = useState(null);
    const [courses, setCourses] = useState(null);
    
    const handleSearch = () => {
      if (searchBar) {
        //@ts-ignore
        setSearchTerm(searchBar.value);
        if (courses) {
          //@ts-ignore
          console.log(courses);
        }
      }
    }

    useEffect(() => {
      const search: any = document.getElementById('search-bar');
      setCourses(data.data);

      if (search) {
        setSearchBar(search);
      }
    });

    return (
        <div>
            <input type='text' id='search-bar' placeholder='search' onChange={handleSearch} value={searchTerm}/>
        </div>
    )
}

export default withStyles(styles)(Search);
