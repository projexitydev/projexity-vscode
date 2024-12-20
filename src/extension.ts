import * as vscode from 'vscode';
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt';
import { createParser } from 'eventsource-parser';
import * as path from 'path';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import {parse} from "csv";
import fetch from 'node-fetch';
import axios from 'axios';

interface Ticket {
    title: string;
    requirements: string;
}

interface Project {
    name: string;
    description: string;
    tickets: Ticket[];
}

const projects: { [repoId: string]: Project } = {
	"889268940": {
	  name: "Wordle Clone",
	  description:
		"Build a web-based Wordle clone using Flask, allowing users to guess a 5-letter word within 6 attempts.",
	  tickets: [
		{
		  title: "1. Create Basic HTML Structure",
		  requirements:
			"In 'index.html', create the basic layout for the Wordle game. Include a grid div with 6 row divs (for attempts), each containing 5 letter slot divs. Add an input field and a 'Submit' button for user guesses. Note: The layout will look unstyled at this stage - styling will be added in the next ticket.",
		},
		{
		  title: "2. Style the Game Grid",
		  requirements:
			"In 'static/main.css', add styles for the game grid. Style the grid container, row divs, and letter slots. Each letter slot should be a square box with borders. Use CSS Grid or Flexbox to ensure proper alignment and spacing of the game elements.",
		},
		{
		  title: "3. Implement Random Word API Integration",
		  requirements:
			"Integrate the Random Word API (https://random-word-api.herokuapp.com/word?length=5) to fetch a random 5-letter word when a new game starts. Implement the fetch logic using the 'requests' library and handle any potential exceptions or errors during the API call.",
		},
		{
		  title: "4. Handle User Input and Guess Validation",
		  requirements:
			"In your Flask app, handle form submissions from the 'Submit' button. Validate that the user's guess is a 5-letter word. Provide appropriate feedback if the word is invalid or not a real word.",
		},
		{
		  title: "5. Implement Feedback on Guesses",
		  requirements:
			"For each valid guess, compare it to the secret word fetched from the API and provide feedback. Display colored tiles to indicate correct letters in the correct place (green), correct letters in the wrong place (yellow), and incorrect letters (gray).",
		},
		{
		  title: "6. Update the UI and Style Guess Display",
		  requirements:
			"Update 'index.html' to display the user's guesses and the corresponding feedback. Style the game grid and tiles in 'static/main.css' to match the Wordle aesthetic, including proper colors for feedback (green, yellow, gray). Ensure that previous guesses remain visible and that the grid updates correctly.",
		},
		{
		  title: "7. Handle Game Win/Loss Conditions",
		  requirements:
			"Implement logic to detect when the user has guessed the correct word or used all their attempts. Display appropriate messages for winning or losing the game.",
		},
		{
		  title: "8. Implement Keyboard Support and Virtual Keyboard",
		  requirements:
			"Add keyboard input functionality: 1) Capture physical keyboard events to handle letter input and backspace, 2) Create an on-screen virtual keyboard that can be clicked and displays letter status (green, yellow, gray) based on guesses. Ensure both input methods work together seamlessly.",
		},
		{
		  title: "9. Test the Game Thoroughly",
		  requirements:
			"Play the game multiple times to ensure all features work correctly. Test for edge cases, such as duplicate letters, and ensure the feedback is accurate.",
		},
		{
		  title: "10. Final Code Review and Clean-Up",
		  requirements:
			"Review your code for any improvements. Remove unnecessary code, optimize functions, and add comments where needed. Ensure code readability and maintainability.",
		},
	  ],
	},
	"871482895": {
	  name: "Weather App",
	  description:
		"Build a fully functional weather app that allows users to search for weather information by city name.",
	  tickets: [
		{
		  title: "1. Set up the Project",
		  requirements:
			"Let’s start simple. We’ve gone ahead and set up a new React project for you already in the codespace. In your src folder, make a new folder named components. Inside it, create a file called WeatherApp.jsx. Now, in WeatherApp.jsx, set up a basic functional React component. It doesn’t need to do much yet—just return a <h1> tag with the title of your app, like “Weather App”. Be sure to export this component at the bottom by using ‘export default WeatherApp;‘. This will ensure you’ll be able to use it elsewhere. Go to App.jsx and import your WeatherApp component. Replace the default JSX there with your new component so it renders when you start the app. Run your app to make sure you can see the title on the browser. Commit message: “Initial commit: Set up basic component structure.”",
		},
		{
		  title: "2. Design the User Interface",
		  requirements:
			"Time to make things look nice! In WeatherApp.jsx, add buttons for a few cities like New York, Los Angeles, and Washington, D.C. These buttons will directly fetch weather data using hardcoded coordinates later. Next, let’s add some basic styling. In your components folder, create a new file called WeatherApp.css. Style the buttons and layout to make everything clean and easy to use. Don’t forget to import the CSS file into WeatherApp.jsx at the top using import './WeatherApp.css';. Check your work by running the app and making sure the buttons are visible and clickable. Commit message: “Designed basic UI with button styling.”",
		},
		{
		  title: "3. Fetch Weather Data from API",
		  requirements:
			"Here comes the exciting part! We’re going to fetch real weather data using the National Weather Service (NWS) API. Each button will trigger a fetch call using hardcoded coordinates for its respective city. Start by using the /points endpoint with coordinates for one city (e.g., Washington, D.C., 38.8894,-77.0352). Write a function that fetches data from this endpoint when the button is clicked. Use fetch() to make the API request and console.log to check the response. Repeat this process for all your city buttons by assigning each button its own set of hardcoded coordinates. Test your app by clicking the buttons and checking the console for the fetched data. Commit message: “Integrated API and logged weather data.”",
		},
		{
		  title: "4. Display Weather Data",
		  requirements:
			"Now that we have the weather data, let’s display it! Parse the response and show details like the city name, temperature, and a brief forecast. Use useState to store the fetched data so it can update dynamically when a button is clicked. Organize the displayed data in a visually appealing layout. For example, show the temperature in large text with conditions below it (e.g., 'Sunny, 75°F'). Use conditional rendering to only show the weather information after data is successfully fetched. If you’re not sure how, you can set an initial state (e.g., null) and check whether the data exists before rendering it. Commit message: “Displayed fetched weather data on the UI.”",
		},
		{
		  title: "5. Handle Errors Gracefully",
		  requirements:
			"Sometimes things don’t go as planned. Let’s prepare for that. Add error handling to your fetch function so it catches network errors or invalid API responses. If there’s an error, display a friendly message like, 'Oops! Unable to fetch weather data.' You can track errors with a simple boolean or a message in the state. Use conditional rendering to only show the error message when it’s needed. Test your app by simulating an error (e.g., turn off your internet) to ensure the error message works as expected. Commit message: “Implemented error handling for API requests.”",
		},
		{
		  title: "6. Finalize and Test the App",
		  requirements:
			"Now let’s focus on making sure your app works seamlessly. Test it thoroughly by: Clicking each city button and verifying that the correct weather data appears. Simulating edge cases, like clicking multiple buttons quickly or triggering an error. Checking the error handling works as expected. Take some time to clean up your code. Remove unnecessary console logs, add comments to explain tricky parts, and ensure everything is easy to read. You can also add a loading spinner or placeholder text while the data is being fetched to improve the user experience. Commit message: “Finalized app with testing and code cleanup.”",
		},
		{
		  title: "7. Enhance Interactivity and Code Organization",
		  requirements:
			"Your app works perfectly—great job! Now let’s polish it up. Refactor your WeatherApp component by breaking it into smaller components, such as: A CityButton component for rendering individual city buttons dynamically. A WeatherDetails component to display fetched weather data cleanly. Use an array of city data (e.g., names and coordinates) and the map function to dynamically render your buttons. This makes your app more maintainable and scales easily if you want to add more cities later. Tip: Consolidating your logic for fetching weather data into a single function that takes coordinates as an argument can make your code cleaner and reusable. If you’re feeling ambitious, experiment with additional styling (e.g., CSS modules, animations) or functionality (e.g., saving favorite cities in local storage). Commit message: “Refactored code into components and added dynamic rendering.”",
		},
		{
		  title: "8. Optional Stretch Goals",
		  requirements:
			"If you want to push your skills further, try these: Use the useEffect hook to fetch weather data automatically for a default city when the app loads. Save favorite cities using local storage so users can access them later. Add advanced styling with CSS modules or styled-components. Display more detailed weather data, like hourly forecasts or wind speeds, if the API supports it. Implement tabs or a carousel for multi-day forecasts. Commit message: “Added stretch goals for advanced functionality.”",
		},
	  ],
	},
  };
  
  


type OpenAIAPIInfo = {
	// mode?: string,
	apiKey?: string,
	// accessToken?: string,
	// proxyUrl?: string
	apiBaseUrl?: string,
	model?: string
};
interface Settings {
  selectedInsideCodeblock?: boolean;
  codeblockWithLanguageId?: boolean;
  keepConversation?: boolean;
  timeoutLength?: number;
  indentOnInserting?: boolean;
}
type WorkingState = 'idle' | 'asking';

export function activate(context: vscode.ExtensionContext) {

	console.log('activating extension "chatgpt"');
	vscode.commands.executeCommand('chatgpt-ai.chatView.focus')
    .then(
      () => console.log("Chat view focused successfully!"),
      (error) => console.error("Failed to focus chat view:", error)
    );
	// Get the settings from the extension's configuration
	const config = vscode.workspace.getConfiguration('chatgpt-ai');

	// Create a new ChatGPTViewProvider instance and register it with the extension's context
	const provider = new ChatGPTViewProvider(context.extensionPath, context.extensionUri);

	// Put configuration settings into the provider
	provider.setOpenAIAPIInfo({
		// mode: config.get('mode'),
		apiKey: config.get('apiKey'),
		apiBaseUrl: config.get('apiBaseUrl'),
		model: config.get('model')
		// accessToken: config.get('accessToken'),
		// proxyUrl: config.get('proxyUrl') === "Custom" ? config.get('customProxyUrl') : config.get('proxyUrl')
	});
	provider.setSettings({
		selectedInsideCodeblock: config.get('selectedInsideCodeblock') || false,
		codeblockWithLanguageId: config.get('codeblockWithLanguageId') || false,
		keepConversation: config.get('keepConversation') || false,
		timeoutLength: config.get('timeoutLength') || 60,
	});

	// Register the provider with the extension's context
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatGPTViewProvider.viewType, provider,  {
			webviewOptions: { retainContextWhenHidden: true }
		})
	);

	vscode.window.onDidChangeTextEditorSelection((event) => provider.setContextSelection(
	  event.textEditor.selection.isEmpty ? 'none' : 'selection'
	));

	const commandHandler = (command:string) => {
		const config = vscode.workspace.getConfiguration('chatgpt-ai');
		const prompt = config.get(command) as string;
		provider.askWithContext(prompt, "selection");
	};

	// Register the commands that can be called from the extension's package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('chatgpt-ai.ask', () =>
			vscode.window.showInputBox({ prompt: 'What do you want to do?' })
				.then((value) => {
					if (value !== undefined && value !== null) {
						provider.askWithContext(value, "selection");
					}
				})
		),
		// vscode.commands.registerCommand('chatgpt-ai.explain', () => commandHandler('promptPrefix.explain')),
		// vscode.commands.registerCommand('chatgpt-ai.refactor', () => commandHandler('promptPrefix.refactor')),
		// vscode.commands.registerCommand('chatgpt-ai.optimize', () => commandHandler('promptPrefix.optimize')),
		// vscode.commands.registerCommand('chatgpt-ai.findProblems', () => commandHandler('promptPrefix.findProblems')),
		// vscode.commands.registerCommand('chatgpt-ai.documentation', () => commandHandler('promptPrefix.documentation')),
		// vscode.commands.registerCommand('chatgpt-ai.complete', () => commandHandler('promptPrefix.complete')),
		vscode.commands.registerCommand('chatgpt-ai.resetConversation', () => provider.resetConversation())
	);

	// Change the extension's session token or settings when configuration is changed
	vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
		if (
			event.affectsConfiguration('chatgpt-ai.apiKey') ||
			event.affectsConfiguration('chatgpt-ai.apiBaseUrl') ||
			event.affectsConfiguration('chatgpt-ai.model')
			// event.affectsConfiguration('chatgpt-ai.mode') ||
			// event.affectsConfiguration('chatgpt-ai.apiKey') ||
			// event.affectsConfiguration('chatgpt-ai.accessToken') ||
			// event.affectsConfiguration('chatgpt-ai.proxyUrl')
		) {
			const config = vscode.workspace.getConfiguration('chatgpt-ai');
			provider.setOpenAIAPIInfo({
				// mode: config.get('mode'),
				apiKey: config.get('apiKey'),
				apiBaseUrl: config.get('apiBaseUrl'),
				model: config.get('model'),
				// accessToken: config.get('accessToken'),
				// proxyUrl: config.get('proxyUrl') === "Custom" ? config.get('customProxyUrl') : config.get('proxyUrl')
			});

			// clear conversation
			provider.resetConversation();
		} else if (event.affectsConfiguration('chatgpt-ai.selectedInsideCodeblock')) {
			const config = vscode.workspace.getConfiguration('chatgpt-ai');
			provider.setSettings({ selectedInsideCodeblock: config.get('selectedInsideCodeblock') || false });
		} else if (event.affectsConfiguration('chatgpt-ai.codeblockWithLanguageId')) {
			const config = vscode.workspace.getConfiguration('chatgpt-ai');
			provider.setSettings({ codeblockWithLanguageId: config.get('codeblockWithLanguageId') || false });
		} else if (event.affectsConfiguration('chatgpt-ai.keepConversation')) {
			const config = vscode.workspace.getConfiguration('chatgpt-ai');
			provider.setSettings({ keepConversation: config.get('keepConversation') || false });
		} else if (event.affectsConfiguration('chatgpt-ai.timeoutLength')) {
			const config = vscode.workspace.getConfiguration('chatgpt-ai');
			provider.setSettings({ timeoutLength: config.get('timeoutLength') || 60 });
		} else if (event.affectsConfiguration('chatgpt-ai.indentOnInserting')) {
			const config = vscode.workspace.getConfiguration('chatgpt-ai');
			provider.setSettings({ indentOnInserting: config.get('indentOnInserting') || false });
		}
	});
}

class ChatGPTViewProvider implements vscode.WebviewViewProvider {
	private _ticket?: string;
private _ticketRequirements?: string;
private _project?: Project;
	public static readonly viewType = 'chatgpt-ai.chatView';
	private _view?: vscode.WebviewView;

	private _chatGPTAPI?: ChatGPTAPI | ChatGPTUnofficialProxyAPI;
	private _conversation?: any;

	// An AbortController for _chatGPTAPI
	private _abortController = new AbortController();

	private _response?: string;
	private _task?: string;
	private _currentMessageNumber = 0;

	private _workingState: WorkingState;

	private _settings: Settings = {
		selectedInsideCodeblock: false,
		codeblockWithLanguageId: false,
		keepConversation: true,
		timeoutLength: 60,
		indentOnInserting: true
	};
	private _openaiAPIInfo?: OpenAIAPIInfo;

	// In the constructor, we store the URI of the extension
	constructor(private readonly _extensionPath: string, private readonly _extensionUri: vscode.Uri) {
		this._workingState = 'idle';
	}
	
	// Set the API key and create a new API instance based on this key
	public setOpenAIAPIInfo(openaiapiInfo: OpenAIAPIInfo) {
		this._openaiAPIInfo = openaiapiInfo;
		this._newAPI();
	}

	public setSettings(settings: Settings) {
		this._settings = {...this._settings, ...settings};
	}

	public getSettings() {
		return this._settings;
	}

	private _setWorkingState(mode: WorkingState) {
		this._workingState = mode;
		this._view?.webview.postMessage({ type: 'setWorkingState', value: this._workingState});
	}

	private _newAPI() {
		if (!this._openaiAPIInfo) {
			console.warn("Invalid OpenAI API info, please set working mode and related OpenAI API info.");
			return null;
		}

		const { 
			// mode, 
			apiKey, 
			// accessToken, 
			// proxyUrl
			apiBaseUrl,
			model
		} = this._openaiAPIInfo;

		// if (mode === "ChatGPTAPI" && apiKey) {
		if (apiKey) {
			this._chatGPTAPI = new ChatGPTAPI({
				apiKey: apiKey,
				apiBaseUrl: apiBaseUrl,
				debug: false,
				completionParams: {
					model
				},
			});
		} else {
			// Handle the case where apiKey is undefined or falsy
			console.error("API key is missing or invalid.");
		}
		// } else if (mode === "ChatGPTUnofficialProxyAPI" && accessToken && proxyUrl) {
		// 	this._chatGPTAPI = new ChatGPTUnofficialProxyAPI({
		// 		accessToken: accessToken,
		// 		apiReverseProxyUrl: proxyUrl,
		// 		debug: false
		// 	});
		// } else {
		// 	console.warn("Invalid auth info, please set working mode and related auth info.");
		// 	return null;
		// }

		this._conversation = null;
		this._currentMessageNumber = 0;
		return this._chatGPTAPI;
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		// set options for the webview, allow scripts
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		// set the HTML for the webview
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

	    // Initialize tickets after webview is ready
		this._initializeTickets().catch(error => {
			console.error('Failed to initialize tickets:', error);
		});

		
		

		// add an event listener for messages received by the webview
		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'loadPrompts':
					{
						// force prompts updating
						// this.loadAwesomePrompts();
						break;
					}
					case 'ticketSelected':
            {
                const selectedTicketTitle = data.value;
                const selectedTicket = this._project?.tickets.find(ticket => ticket.title === selectedTicketTitle);
                if (selectedTicket) {
					console.log(selectedTicket)
                    this._ticket = selectedTicket.title;
                    this._ticketRequirements = selectedTicket.requirements;
                }
                break;
            }
			case 'checkCode': {
				const { ticket, context } = data;
	
				// Retrieve the ticket requirements and project details
				const selectedTicket = this._project?.tickets.find(t => t.title === ticket);
				const requirements = selectedTicket?.requirements;
	
				// Get the code from all opened files based on context
				let mergedCode = '';
				if (context === 'all_opened_files') {
					const activeTabGroup = vscode.window.tabGroups.activeTabGroup;
					const tabs = activeTabGroup.tabs;
	
					for (const tab of tabs) {
						const uri = (tab.input as vscode.TabInputText).uri;
						const content = (await vscode.workspace.fs.readFile(uri)).toString();
						mergedCode += `## ${uri.fsPath}\n\`\`\`\n${content}\n\`\`\`\n`;
					}
				}
	
				// Construct the message to send to the AI for code validation
				const aiPrompt = `You are helping with the project "${this._project?.name}" on the ticket "${ticket}". The ticket requirements are "${requirements}". Please review the following code. If the code meets the ticket requirments, say 'Looks good to me!'. If the code does not meet the ticket requirments, say 'Code needs more work.' and provide feedback. : \n${mergedCode}`;
				// Send the prompt to ChatGPT
				await this._askChatGPT(`Checking Code | Ticket : ${ticket} | Ticket Requirments: ${requirements}`, aiPrompt);
				break;
			}
				case 'codeSelected': {
					let code = data.value;
					const editor = vscode.window.activeTextEditor;
					if (this._settings.indentOnInserting && editor && !editor.selection.isEmpty) {
						const selection = editor.selection;
						const endLine = selection.end.line;
						const endLineText = editor.document.lineAt(endLine).text;
						const endIndent = endLineText.match(/^\s*/)?.[0] || '';
						code = code.trim().replace(/\r?\n/g, `\n${endIndent}`);
					}

					// Get active text editor
					const currentEditor = vscode.window.activeTextEditor;
					if (currentEditor) {
						// Get current selection
						const selection = currentEditor.selection;

						// Replace selection with snippet text
						currentEditor.edit((editBuilder) => {
							editBuilder.replace(selection, code);
						});

						// Select and format inserted code
                        let updatedSelection = new vscode.Selection(selection.start.line, selection.start.character, selection.start.line + code.split('\n').length - 1, code.split('\n')[code.split('\n').length - 1].length);
                        currentEditor.selection = updatedSelection;

						if (this._settings.indentOnInserting) {
							vscode.commands.executeCommand("editor.action.formatSelection");
						}
					}
										
					break;
				}
				case 'sendPrompt':
					{
						this.askWithContext(data.value.task, data.value.context);
						break;
					}
				case 'abort':
					{
						this.abort();
						break;
					}
				case 'resetConversation':
					{
						this.resetConversation();
						break;
					}
			}
		});
	}

	private _prompts: String[] = [];

	private _loadAwesomePrompts(){
		// Fetch https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv
		fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv')
			.then(response => response.text())
			.then(csv => {
				parse(csv, { columns: true, relax_quotes: true, ltrim: true, rtrim: true }, (err, output) => {
					const prompts = output.map((row: any) => row['prompt']);
					this._view?.webview.postMessage({type: 'promptsLoaded', value: prompts});
				});
			});
	}

	/**
 	 * Search for matched prompts in the prompts.csv file
 	 */
	private async _searchPrompts(userInput: string): Promise<string[]> {
		// If the prompts haven't been loaded yet, fetch them from GitHub
		if (this._prompts?.length === 0) {
			const response = await fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv');
			const data = await response.text();
			// Parse the CSV data and store it in the prompts array with npm csv
			parse(data, { columns: true, relax_quotes: true, ltrim: true, rtrim: true }, (err, output) => {
				this._prompts = output.map((row: any) => row.prompt);
			});
		}

		const matchedPrompts: string[] = [];
		// Search the prompts array for matches based on the user input
		this._prompts.forEach(prompt => {
			if (typeof prompt === 'string' && prompt.toLowerCase().includes(userInput.toLowerCase())) {
				matchedPrompts.push(prompt as string);
			}
		});
	
		return matchedPrompts;
	}

	public async resetConversation() {
		if (this._workingState === 'idle') {
			if (this._conversation) {
				this._conversation = null;
			}
			this._currentMessageNumber = 0;
			this._task = '';
			this._response = '';
			this._view?.webview.postMessage({ type: 'setTask', value: '' });
			this._view?.webview.postMessage({ type: 'clearResponses', value: '' });
			this._view?.webview.postMessage({ type: 'setConversationId', value: ''});
		} else {
			console.warn('Conversation is not in idle state. Resetting conversation is not allowed.');
		}
	}

	public async askWithContext(task: string, context: string): Promise<void> {
		this._task = task || "";
	
		if (!this._chatGPTAPI) {
			this._newAPI();
		}
	
		// Define the system prompt to guide ChatGPT's behavior
		const systemPrompt = `You are assisting a student with their project as a tutor. The project is "${this._project?.name}" and the task is "${this._ticket}". The requirements are: "${this._ticketRequirements}". You must provide guidance and help the student understand the concepts without giving direct answers. Avoid giving a complete solution directly, but use helpful examples and explanations to teach the student.`;
		console.log(systemPrompt)
		// Don't include the system prompt in the user-facing message
		let searchPrompt: string;
		let languageId: string;
	
		switch (context) {
			case 'selection':
				const selection = vscode.window.activeTextEditor?.selection;
				const selectedText = selection && vscode.window.activeTextEditor?.document.getText(selection);
				languageId = this._settings.codeblockWithLanguageId
					? vscode.window.activeTextEditor?.document?.languageId || ""
					: "";
				searchPrompt = selectedText ? `${task}\n${"```"}${languageId}\n${selectedText}\n${"```"}\n` : task;
				break;
			case 'whole_file':
				const activeDoc = vscode.window.activeTextEditor?.document;
				languageId = this._settings.codeblockWithLanguageId ? activeDoc?.languageId || "" : "";
				const fileContent = activeDoc ? activeDoc.getText() : "";
				searchPrompt = `${task}\n${"```"}${languageId}\n${fileContent}\n${"```"}\n`;
				break;
				case 'all_opened_files':
    const tabGroups = vscode.window.tabGroups.all;
    let mergedContent = '';
    const copiedFiles: string[] = [];

    for (const group of tabGroups) {
        for (const tab of group.tabs) {
            const input = tab.input;
            if (input instanceof vscode.TabInputText && input.uri) {
                const uri = input.uri;
                if (uri.scheme === 'file') {
                    try {
                        const filename = uri.fsPath;
                        const contentBytes = await vscode.workspace.fs.readFile(uri);
                        const content = Buffer.from(contentBytes).toString('utf8');
                        mergedContent += `## ${filename}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
                        copiedFiles.push(filename);
                    } catch (error) {
                        console.error('Error reading file:', uri.fsPath, error);
                    }
                }
            }
        }
    }

    if (copiedFiles.length === 0) {
        vscode.window.showInformationMessage('No valid text files are open to check.');
        searchPrompt = task;
    } else {
        searchPrompt = `${task}\n${mergedContent}`;
    }
    break;

				default:
					searchPrompt = task;
			}
	
		// Send both the system prompt and the user's message to ChatGPT
		const finalPrompt = `Your intstructions: ${systemPrompt} User message: ${searchPrompt}`;
		this._askChatGPT(task, finalPrompt);
	}
	


	private async _askChatGPT(task: string, searchPrompt: string): Promise<void> {
        this._view?.show?.(true);

        // if (!this._openaiAPIInfo?.apiKey) {
        //     const errorMessage = "[ERROR] API key not set or wrong, please go to extension settings to set it (read README.md for more info).";
        //     this._view?.webview.postMessage({ type: "addEvent", value: { text: errorMessage } });
        //     return;
        // }

        this._view?.webview.postMessage({ type: "setTask", value: this._task });

        const requestMessage = {
            type: "addRequest",
            value: { text: task, parentMessageId: this._conversation?.parentMessageId },
        };

        this._view?.webview.postMessage(requestMessage);

        this._currentMessageNumber++;

        this._setWorkingState("asking");

        try {
            const currentMessageNumber = this._currentMessageNumber;

            // Make a request to your backend
            const response = await axios.post('http://projexity.us-east-2.elasticbeanstalk.com/api/chat', {
                prompt: searchPrompt,
                conversationId: this._conversation?.conversationId,
                parentMessageId: this._conversation?.parentMessageId,
                apiBaseUrl: this._openaiAPIInfo?.apiBaseUrl,
                model: this._openaiAPIInfo?.model
            }, {
                responseType: 'stream',
            },
		);
		let buffer = '';
const parser = createParser((event) => {
  if (event.type === 'event') {
    const partialResponse = JSON.parse(event.data);
    console.log("Parsed response:", partialResponse);
    
    // Handle the parsed response
    if (this._view) {
      const responseMessage = { type: "addResponse", value: partialResponse };
      this._view?.webview.postMessage(responseMessage);
    }
  }
});

response.data.on('data', (chunk: Buffer) => {
	console.log("Chunk received: ", chunk.toString());
    try {
        const partialResponse = JSON.parse(chunk.toString());
        console.log("Parsed chunk:", partialResponse);
        
        // Handle the parsed response here...
        if (partialResponse.id === partialResponse.parentMessageId || this._currentMessageNumber !== currentMessageNumber) {
            return;
        }

        if (this._view) {
            const responseMessage = { type: "addResponse", value: partialResponse };
            console.log("Sending message to frontend:", responseMessage);
            this._view?.webview.postMessage(responseMessage);
        } else {
            console.log("View is not visible or webview is not available.");
        }
    } catch (error) {
        // Handle JSON parse errors without breaking the flow
        if (!(error instanceof SyntaxError)) {
            console.error("Error processing chunk:", error);
        }
        // If it's a syntax error, likely the JSON is incomplete, so we keep accumulating
    }
});


            response.data.on('end', () => {
                if (this._settings.keepConversation) {
                    this._conversation = {
                        conversationId: response.data.conversationId,
                        parentMessageId: response.data.id,
                    };
                    this._view?.webview?.postMessage({ type: "setConversationId", value: response.data.conversationId });
                }
                this._setWorkingState("idle");
            });

        } catch (e: any) {
            console.error(e);
            let errorMessage = `[ERROR] ${e}`;

			if (e?.response?.status === 429) {
				errorMessage = "You've reached your limit of 50 messages. Please wait 24 hours before trying again.";
			}


            this._view?.show?.(true);
            this._view?.webview.postMessage({ type: "addEvent", value: { text: errorMessage } });
            this._setWorkingState("idle");
        }
    }


	public abort(){
		this._abortController?.abort();
		this._setWorkingState("idle");

		this._view?.webview.postMessage({type: 'addEvent', value: {text: '[EVENT] Aborted by user.'}});			

		// reset the controller
		this._abortController = new AbortController();
	}

	public setContextSelection(context: string) {
		this._view?.webview.postMessage({type: 'setContextSelection', value: context}); 
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const indexHtmlPath = path.join(this._extensionPath, 'media', 'html', 'index.html');
		const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
		
		const $ = cheerio.load(indexHtml);
		$('#responses').empty();

		// Remove all <style> tags with class 'editing'
		$('head > link.editing').remove();
		$('head > script.editing').remove();

		// hide div.response_templates
		$('div#response_templates').css('display', 'none');

		// remove all elements of class editing in div#response_templates
		$('div#response_templates .editing').remove();
		
		const scriptUri = webview.asWebviewUri((vscode.Uri as any).joinPath(this._extensionUri, 'dist', 'main.js'));
		const tailwindUri = webview.asWebviewUri((vscode.Uri as any).joinPath(this._extensionUri, 'media', 'scripts', 'tailwind.min.js'));
		const highlightcssUri = webview.asWebviewUri((vscode.Uri as any).joinPath(this._extensionUri, 'media', 'styles', 'highlight-vscode.min.css'));
		const jqueryuicssUri = webview.asWebviewUri((vscode.Uri as any).joinPath(this._extensionUri, 'media', 'styles', 'jquery-ui.css'));
		const indexcssUri = webview.asWebviewUri((vscode.Uri as any).joinPath(this._extensionUri, 'media', 'styles', 'index.css'));

		return $.html()
			  .replace('{{tailwindUri}}', tailwindUri.toString())
			  .replace('{{highlightcssUri}}', highlightcssUri.toString())
			  .replace('{{jqueryuicssUri}}', jqueryuicssUri.toString())
			  .replace('{{indexcssUri}}', indexcssUri.toString())
			  .replace('{{scriptUri}}', scriptUri.toString());
	}

	private async _initializeTickets() {
		const repoId: string = process.env.REPO_ID ?? '871482895';
		
		try {
			// Wait for webview to be ready
			if (!this._view?.visible) {
				console.log('Waiting for webview to become visible...');
				await new Promise<void>((resolve) => {
					const disposable = vscode.window.onDidChangeVisibleTextEditors(() => {
						if (this._view?.visible) {
							disposable.dispose();
							resolve();
						}
					});
				});
			}
	
			await new Promise(resolve => setTimeout(resolve, 3000));
	
			console.log('Webview is visible, proceeding with initialization');
	
			// Ensure webview is available
			if (!this._view?.webview) {
				throw new Error('Webview not available');
			}
	
			this._project = projects[repoId];
			if (!this._project) {
				throw new Error(`Project not found for repoId: ${repoId}`);
			}
	
			const tickets = this._project.tickets.map(ticket => ticket.title);
			console.log('Prepared tickets:', tickets);
	
			// Add retry logic for sending message
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					console.log(`Attempt ${retryCount + 1} to send tickets to webview`);
					await this._view.webview.postMessage({ type: 'setTickets', value: tickets });
					this._ticket = this._project.tickets[0]?.title;
					this._ticketRequirements = this._project.tickets[0]?.requirements;
					
					// Send welcome message after tickets are initialized
					const welcomeMessage = {
						type: "addRequest",
						value: {
							text: `👋 Hello, I'm Projexity AI, here to assist you.													  
													📂 **Project**: *${this._project?.name}*													  
													📝 **Description**: ${this._project?.description}													  
													✅ **When you're ready**: Click the "Check Code" button when you feel you're finished, and I'll let you know if you're good to move on to the next ticket!													  
													🔍 Please choose the ticket you are currently working on at the bottom, so I can help if you get stuck!													  													  
													🚀 Let's get started!`,
							parentMessageId: this._conversation?.parentMessageId
						},
					};
					
					
					await this._view.webview.postMessage(welcomeMessage);
					console.log('Successfully sent tickets and welcome message to webview');
					break;
				} catch (error) {
					retryCount++;
					console.error(`Failed attempt ${retryCount}:`, error);
					if (retryCount === maxRetries) {
						throw error;
					}
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}
			
			vscode.window.showInformationMessage(`Loaded ${tickets.length} tickets for ${this._project.name}`);
		} catch (error) {
			console.error('Error initializing tickets:', error);
			vscode.window.showErrorMessage('Failed to load project tickets. Please reload the extension.');
			
			if (this._view?.webview) {
				this._view.webview.postMessage({ 
					type: 'setTickets', 
					value: ['Please reload the extension'] 
				});
			}
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}