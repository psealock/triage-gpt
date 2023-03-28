const { Octokit } = require( 'octokit' );
const { cleanIssueBody } = require( './data/lib' );

const octokit = new Octokit( {
	auth: process.env.GITHUB_TOKEN,
} );

const getIssue = async ( number ) => {
	const { data } = await octokit.request(
		'GET /repos/{owner}/{repo}/issues/{issue_number}',
		{
			owner: 'woocommerce',
			repo: 'woocommerce',
			issue_number: number,
		}
	);

	return data;
};

const formatIssueIntoPrompt = ( issue ) => cleanIssueBody( issue.body );

const getCompletion = async ( number ) => {
	const issue = await getIssue( number );
	const prompt = formatIssueIntoPrompt( issue );
	return prompt;
};

getCompletion( 37462 ).then( console.log );
