import React, { useState, useEffect } from 'react'
import '../css/style.css'
import Fuse from 'fuse.js'

function Search(data: any) {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchBar, setSearchBar] = useState(null);
    const [courses, setCourses] = useState(null);

    let fuse: string;
    const options = {
      keys: ['subject', 'number']
    }
    
    const handleSearch = () => {
      if (searchBar) {
        //@ts-ignore
        setSearchTerm(searchBar.value);
      }
      if (searchTerm) {
        const result = fuse.search(searchTerm);
        console.log(result);
      }
    }

    useEffect(() => {
      const search: any = document.getElementById('search-bar');
      setCourses(data.data);

      if (courses) {
        // @ts-ignore
        fuse = new Fuse(courses, options);
      }

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

export default Search;