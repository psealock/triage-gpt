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
			.replace( '### Description\r\n\r\n', '' )
	);
};

module.exports = { cleanIssueBody };
