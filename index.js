const { Octokit } = require( 'octokit' );
const { cleanIssueBody } = require( './data/lib' );
const { exec } = require( 'child_process' );

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
	exec( api, ( error, stdout, stderr ) => {
		if ( error ) {
			console.log( `error: ${ error.message }` );
			return;
		}
		if ( stderr ) {
			console.log( `stderr: ${ stderr }` );
			return;
		}
		console.log( `stdout: ${ stdout }` );
	} );
};

getCompletion( 37416 );

// 37462 -> 1891051446, "focus: onboarding wizard [team:Ghidorah]"
