const { Octokit } = require('octokit');

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

const cleanIssueBody = (body) => {
	return (
		body
			// Remove environment info
			.replace(/### WordPress Environment(.|\t|\r|\n|\f)*/g, '')
			// Remove prerequisites
			.replace(/### Prerequisites(.|\t|\r|\n|\f)*duplicate\.\n/, '')
	);
};

const getIssues = async () => {
	const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
		owner: 'woocommerce',
		repo: 'woocommerce',
		per_page: 10,
		state: 'closed',
	});

	return (
		data
			// ignore pull requests
			.filter((issue) => {
				return issue.pull_request === undefined;
			})
			.map((issue) => {
				return {
					number: issue.number,
					body: cleanIssueBody(issue.body),
					labels: issue.labels.map((label) => label.id), // filter out needs: triage etc
				};
			})
	);
};

getIssues().then(console.log);
// getIssues();

// console.log(process.env.OPENAI_API_KEY);
