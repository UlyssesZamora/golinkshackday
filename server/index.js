const express = require("express");
const axios = require('axios');
const cors = require('cors');


const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());


app.get("/stats", async (req, res) => {
    try {
        const { username, forked } = req.query;
        // const username = 'seantomburke'
        // const forked = false;
        const resPerPage = 100;
        let repositories = [];
        const accessToken = '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'

        for (let page = 1; ; page++) {
            const response = await axios.get(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${resPerPage}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            repositories = repositories.concat(response.data);

            if (response.data.length < resPerPage) {
                break;
            }
        }

        // Filter forked repositories if 'forked' query parameter is set to false
        let totalForkCount = 0;
        if (forked === "false") {
            const len = repositories.length;
            repositories = repositories.filter(repo => !repo.fork);
            totalForkCount = len - repositories.length;
        } else {
            totalForkCount = repositories.filter(repo => repo.fork).length;
        }

        const totalCount = repositories.length;
        let totalStargazers = 0;

        for (const repo of repositories) {
            totalStargazers += repo.stargazers_count;
            // totalForkCount += repo.forks_count;
        }
        const averageSize = avgSize(repositories);
        const languageStats = mostUsedLanguage(repositories);

        const response = {
            totalCount,
            totalStargazers,
            totalForkCount,
            averageSize,
            languageStats,
        };

        // Return the response in JSON format
        res.json(response);
    } catch (error) {
        // Handle errors
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

const avgSize = (repos) => {
    let totalSize = 0;
    for (const repo of repos) {
        totalSize += repo.size;
    }

    const averageSize = totalSize / repos.length;

    if (averageSize < 1024) {
        return `${averageSize.toFixed(0)} KB`;
    } else if (averageSize < 1024 * 1024) {
        return `${(averageSize / 1024).toFixed(0)} MB`;
    } else {
        return `${(averageSize / (1024 * 1024)).toFixed(0)} GB`;
    }
}

const mostUsedLanguage = (repos) => {
    const languageMap = {};

    repos.forEach(repo => {
        const language = repo.language;
        if (language) {
            if (language in languageMap) {
                languageMap[language]++;
            } else {
                languageMap[language] = 1;
            }
        }
    });

    const languageStats = Object.entries(languageMap)
        .sort((a, b) => b[1] - a[1])
        .map(([language, count]) => ({ language, count }));

    return languageStats;
}

app.get("/", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});