import React from 'react'
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

function Search() {

    return (
        <div className="searchbar">
            <SearchBar 
            options={data} 
            getOptionLabel={(data) => data.value}
            style={{width: '100%'}}

    renderInput={(params) => <TextField {...params} label='Enter a course name' margin='none' variant='filled' color="secondary" />} />
        </div>
    )
}

export default withStyles(styles)(Search);