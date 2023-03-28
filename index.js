const { Octokit } = require( 'octokit' );
const { cleanIssueBody } = require( './data/lib' );
const util = require( 'node:util' );
const exec = util.promisify( require( 'node:child_process' ).exec );
const { Command } = require( 'commander' );

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

const formatIssueIntoPrompt = ( issue ) => {
	return cleanIssueBody( issue.body ).replace( /"/g, '\\"' );
};

const getCompletion = async ( number ) => {
	console.log( `Getting completion for issue #${ number }` );
	const issue = await getIssue( number );
	console.log( `Issue #${ number } retrieved` );
	const prompt = formatIssueIntoPrompt( issue );
	const api = `openai api completions.create -m curie:ft-personal-2023-03-28-04-32-35 -p "${ prompt }"`;

	console.log( `Calling openai api` );

	const { stdout, stderr } = await exec( api );
	if ( stderr ) {
		console.log( `stderr: ${ stderr }` );
		return stderr;
	}
	return stdout;
};

const program = new Command();

program
	.name( 'triage-gpt' )
	.description( 'CLI to triage WooCommerce issues' )
	.version( '0.0.1' );

program
	.command( 'triage' )
	.description( 'get a focus label' )
	.argument( '<issueNumber>', 'issue to triage' )
	.action( async ( issueNumber ) => {
		const completion = await getCompletion( issueNumber );
		console.log( completion );
		// const completion = '[3943425133] paul was here [3943425720]';

		const regex = /\[(\d*)\]/gm;
		let resultsArr = [];
		const labelIds = [];

		while ( ( resultsArr = regex.exec( completion ) ) !== null ) {
			console.log( `Found label id ${ resultsArr[ 1 ] }` );
			labelIds.push( resultsArr[ 1 ] );
		}
		if ( labelIds.length === 0 ) {
			console.log( 'No labels found' );
			return;
		}
	} );

program.parse(); //37416
