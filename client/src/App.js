import './App.css';
import React, { useState} from 'react';
import axios from 'axios';


function App() {
    const [data, setData] = useState([]);
    const [forked, setForked] = useState(false);
    const [username, setUsername] = useState('');

    const handleSearch = () => {
        const accessToken = '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'
        axios.get(`http://localhost:3001/stats?username=${username}&forked=${forked}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
        .then((response) => {
            setData(response.data);
          })
          .catch((error) => {
            alert("user not found")
            console.error('Error:', error.message);
          });
      };

  return (
    <div>
        <div>
            Enter Github Username:
          <input
            type="text"
            placeholder="Enter a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>
            Show Forked Repos?
            <input
              type="checkbox"
              checked={forked}
              onChange={(e) => setForked(e.target.checked)}
            />
          </label>
          <button onClick={handleSearch}>Search</button>
        </div>
        {data ? (
          <div>
            <p>Total Repo Count: {data.totalCount}</p>
            <p>Total Stargazers: {data.totalStargazers}</p>
            <p>Total Fork Count: {data.totalForkCount}</p>
            <p>Average repo Size: {data.averageSize}</p>
            <p>Language Stats:</p>
            <ul>
              {data && data.languageStats && data.languageStats.map((item, index) => (
                <li key={index}>
                  Language: {item.language} - Count: {item.count}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Loading...</p>
        )}
    </div>
  );
}

export default App;
