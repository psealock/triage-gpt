const { Octokit } = require( 'octokit' );
const { appendFile } = require( 'node:fs/promises' );
const { cleanIssueBody } = require( './lib' );

const octokit = new Octokit( {
	auth: process.env.GITHUB_TOKEN,
} );

const keepOnlyFocusLabels = ( label ) => {
	return /focus:/gm.test( label.name );
};

const formatIssues = ( issue ) => {
	return JSON.stringify( {
		prompt: issue.body + '\n\n###\n\n',
		completion: ' ' + JSON.stringify( issue.labels ),
	} );
};

const getIssues = async ( page ) => {
	const { data } = await octokit.request(
		'GET /repos/{owner}/{repo}/issues',
		{
			owner: 'woocommerce',
			repo: 'woocommerce',
			per_page: 100,
			page,
			state: 'closed',
		}
	);

	return (
		data
			// Ignore pull requests
			.filter( ( issue ) => {
				return issue.pull_request === undefined && !! issue.body;
			} )
			// Clean body and labels
			.map( ( issue ) => {
				return {
					number: issue.number,
					body: cleanIssueBody( issue.body ),
					labels: issue.labels
						.filter( keepOnlyFocusLabels )
						.map( ( label ) => label.id )
						// Make sure identical combinations of labels are the same
						.sort(),
				};
			} )
			// Remove issues without labels
			.filter( ( issue ) => issue.labels.length > 0 )
	);
};

const createJSONLFile = async ( pages ) => {
	for ( let i = 1; i <= pages; i++ ) {
		// For some reason, GH api doesn't like these pages
		const pagesNotWorking = [ 9, 11, 13, 21, 22, 24, 25, 28 ];
		if ( pagesNotWorking.includes( i ) ) {
			console.log( `Skipping page ${ i }` );
			console.log( '<------------------------->' );
			continue;
		}
		console.log( `Fetching page ${ i }` );
		const issues = await getIssues( i );
		console.log( `Fetched ${ issues.length } issues` );
		const data = issues.map( formatIssues );

		try {
			console.log( `Writing page ${ i }` );
			await appendFile( 'data/data.jsonl', data.join( '\n' ) + '\n' );
			console.log( `Wrote page ${ i }` );
			console.log( '<------------------------->' );
		} catch ( err ) {
			console.error( err );
		}
	}
};

createJSONLFile( 30 );

// openai api completions.create -m curie:ft-personal-2023-03-28-04-32-35 -p <YOUR_PROMPT>
