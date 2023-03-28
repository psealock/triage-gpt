const { Octokit } = require( 'octokit' );
const { appendFile } = require( 'node:fs/promises' );

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
						.filter( removeStatusLabels )
						.map( ( label ) => label.id ),
				};
			} )
			// Remove issues without labels
			.filter( ( issue ) => issue.labels.length > 0 )
	);
};

const createJSONLFile = async ( pages ) => {
	for ( let i = 29; i <= pages; i++ ) {
		if ( i === 9 ) {
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

// console.log(process.env.OPENAI_API_KEY);
