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
			.replace( "### Describe the solution you'd like\r\n\r\n" )
			.replace( '\n### Describe the bug\n\n', '' )
			.replace( ':**\r\n\r\n', '' )
			.replace( '\n### Describe the bug\n\n', '' )
			.replace( '**Description**\n\n', '' )
			.replace(
				'### Prerequisites\r\n\r\n- [X] I have carried out troubleshooting steps and I believe I have found a bug.\r\n- [X] I have searched for similar bugs in both open and closed issues and cannot find a duplicate.\r\n\r\n### Describe the bug\r\n\r\n',
				''
			)
			.replace( '### Description\n\n', '' )
			.replace( '**Issue Description:**\r\n\r\n', '' )
			.replace( "### Describe the solution you'd like\n\n", '' )
			.replace(
				'### Prerequisites\r\n\r\n- [ ] I have carried out troubleshooting steps and I believe I have found a bug.\r\n- [ ] I have searched for similar bugs in both open and closed issues and cannot find a duplicate.\r\n\r\n',
				''
			)
			.replace( '**Issue Description', '' )
			.replace( '**User story**\r\n\r\n- ', '' )
			.replace( '### Describe the bug\r\n\r\n', '' )
			.replace( '**Description:** ', '' )
			.replace( '**Description**\r\n', '' )
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
	for ( let i = 29; i <= pages; i++ ) {
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
