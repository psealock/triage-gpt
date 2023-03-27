const { Octokit } = require( 'octokit' );
const { writeFile } = require( 'node:fs/promises' );

const octokit = new Octokit( {
	auth: process.env.GITHUB_TOKEN,
} );

const cleanIssueBody = ( body ) => {
	return (
		body
			// Remove environment info
			.replace( /### WordPress Environment(.|\t|\r|\n|\f)*/g, '' )
			// Remove prerequisites
			.replace( /### Prerequisites(.|\t|\r|\n|\f)*duplicate\.\n/, '' )
			// Remove other issue text
			.replace(
				/<!-- This form is for other issue types(.|\t|\r|\n|\f)*Issue Description/gm,
				''
			)
	);
};

const removeStatusLabels = ( label ) => {
	return (
		! /needs:/gm.test( label.name ) &&
		! /status:/gm.test( label.name ) &&
		! /type:/gm.test( label.name )
	);
};

const formatIssueToJSONString = ( issue ) => {
	return JSON.stringify( {
		context: issue.body,
		completion: JSON.stringify( issue.labels ),
	} );
};

const getIssues = async () => {
	const { data } = await octokit.request(
		'GET /repos/{owner}/{repo}/issues',
		{
			owner: 'woocommerce',
			repo: 'woocommerce',
			per_page: 20,
			state: 'closed',
		}
	);

	return (
		data
			// Ignore pull requests
			.filter( ( issue ) => {
				return issue.pull_request === undefined;
			} )
			// Clean body and labels
			.map( ( issue ) => {
				return {
					number: issue.number,
					body: cleanIssueBody( issue.body ),
					labels: issue.labels
						.filter( removeStatusLabels )
						.map( ( label ) => label.id ),
				};
			} )
			// Remove issues without labels
			.filter( ( issue ) => issue.labels.length > 0 )
	);
};

const createJSONLFile = async () => {
	const issues = await getIssues();
	const data = issues.map( formatIssueToJSONString );

	try {
		await writeFile( 'data/data.jsonl', data.join( '\n' ) );
		return issues;
	} catch ( err ) {
		console.error( err );
	}
};

createJSONLFile().then( console.log );

// console.log(process.env.OPENAI_API_KEY);
