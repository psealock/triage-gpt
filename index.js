const { Octokit } = require('octokit');

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

const getIssues = async () => {
	const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
		owner: 'woocommerce',
		repo: 'woocommerce',
		per_page: 1,
		state: 'closed',
	});

	return data.map((issue) => {
		return {
			number: issue.number,
			body: issue.body,
			labels: issue.labels.map((label) => label.id), // filter out needs: triage etc
		};
	});
};

getIssues().then(console.log);

// console.log(process.env.OPENAI_API_KEY);
