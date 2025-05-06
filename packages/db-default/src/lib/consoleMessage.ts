import chalk from 'chalk';

function getIndentation(indent: number): string {
	return ' '.repeat(indent * 2);
}

export function startScript(message: string): void {
	console.log(`\n${chalk.underline(`🚀 ${message.toUpperCase()}`)}`);
}

export function endScript(): void {}

export function consoleMessage(
	message: string | unknown,
	type: 'info' | 'success' | 'error' | 'warning' | 'comment' | null = null,
	indent = 0,
): void {
	const messageString =
		typeof message === 'string' ? `${getIndentation(indent)}${message}` : message;
	switch (type) {
		case 'info':
			console.log(messageString);
			break;
		case 'success':
			console.log(messageString);
			break;
		case 'error':
			console.error(messageString);
			break;
		case 'warning':
			console.warn(messageString);
			break;
		case 'comment':
			console.log(chalk.gray(messageString));
			break;
		default:
			console.log(messageString);
	}
}

export function startProcess(text: string): void {
	console.log(`\n${chalk.blue(`[${text} - START]`)}`);
}

export function endProcess(
	text: string,
	result: 'success' | 'error' | 'warning' | null = null,
	resultMessage = '',
): void {
	let resultText = '';
	if (result === 'success') {
		resultText = `🟢 ${chalk.green(`${resultMessage}OK `)}`;
	} else if (result === 'error') {
		resultText = `🔴 ${chalk.red(`${resultMessage}HIBA `)}`;
	} else if (result === 'warning') {
		resultText = `🟡 ${chalk.yellow(resultMessage)}`;
	}
	console.log(chalk.blue(`[${text} - VÉGE] ${resultText}`));
}

export function subProcess(
	text: string,
	type: 'info' | 'success' | 'error' | 'warning' | null = null,
	extraInfo = '',
	indent = 1,
	startWithNewLine = false,
): void {
	let icon = '';
	const indentation = getIndentation(indent);
	if (type === 'info') {
		icon = chalk.blue('i ');
	} else if (type === 'success') {
		icon = chalk.green('✔ ');
	} else if (type === 'error') {
		icon = chalk.red('X ');
	} else if (type === 'warning') {
		icon = chalk.yellow('⚠️ ');
	}
	console.log(
		`${startWithNewLine ? '\n' : ''}${indentation}${icon}${text} ${chalk.cyan(extraInfo)}`,
	);
}
