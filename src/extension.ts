import * as vscode from 'vscode';
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from 'chatgpt';

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
	"871482895": {
	  name: "Weather App",
	  description: "Build a fully functional weather app that allows users to search for weather information by city name.",
	  tickets: [
		{
		  title: "1. Create the Main Component Structure (WeatherApp)",
		  requirements: "Set up the core React component structure by creating a functional component named WeatherApp. This component will serve as the base for the entire weather application where other components and logic will be integrated.",
		},
		{
		  title: "2. Design the User Interface with Search Bar",
		  requirements: "Design the basic UI for the weather app by creating a search bar where users can enter the name of a city. Include a 'Get Weather' button that users will click to fetch the weather data. Make sure the layout is intuitive and visually appealing.",
		},
		{
		  title: "3. Visit OpenWeatherMap API Website",
		  requirements: "Navigate to the OpenWeatherMap website (https://openweathermap.org/) to explore their weather API options. Familiarize yourself with the different endpoints, data formats, and features that will be useful for fetching weather data.",
		},
		{
		  title: "4. Create an Account on OpenWeatherMap",
		  requirements: "Sign up for a free account on the OpenWeatherMap website to gain access to the API services. Completing this step is essential as you will need an account to generate the API key for making requests to fetch weather data.",
		},
		{
		  title: "5. Read API Documentation for OpenWeatherMap",
		  requirements: "Go through the OpenWeatherMap API documentation to understand how to make requests to the API. Take note of the parameters needed, such as city name and API key, and learn about the data format returned by the API.",
		},
		{
		  title: "6. Obtain OpenWeatherMap API Key",
		  requirements: "Generate an API key from your OpenWeatherMap account. This key is required for making requests to the API. For simplicity, hardcode the API key directly into your project to quickly get started with the data fetching process.",
		},
		{
		  title: "7. Create a Function to Fetch Weather Data",
		  requirements: "Write a function inside the WeatherApp component that makes a request to the OpenWeatherMap API using the hardcoded API key and the city name provided by the user. Ensure the function retrieves the weather data in metric units (Celsius).",
		},
		{
		  title: "8. Handle User Input for City Search",
		  requirements: "Implement the logic to capture the user's input from the search bar and store it in the component state. Make sure the input value updates dynamically as the user types and is ready to be used when making the API request.",
		},
		{
		  title: "9. Implement API Error Handling for Invalid Cities",
		  requirements: "Add error handling logic to the fetch function to manage scenarios where the user enters an invalid city name. Display a user-friendly error message on the UI, such as 'City not found', if the API request fails or returns no results.",
		},
		{
		  title: "10. Add a Loading Spinner During API Requests",
		  requirements: "Integrate a loading spinner using a library like react-loader-spinner to indicate when the weather data is being fetched. The spinner should be visible while the API request is in progress and hidden once the data is retrieved or an error occurs.",
		},
		{
		  title: "11. Display Weather Data on the UI",
		  requirements: "Design the UI to display the fetched weather data, including temperature, city name, country, weather conditions, and an icon representing the weather. Make sure the data is presented clearly and is easy to read for the user.",
		},
		{
		  title: "12. Integrate Weather Icons from OpenWeatherMap",
		  requirements: "Use the weather icon codes provided by the OpenWeatherMap API to display appropriate weather icons in the UI. This will enhance the visual appeal of the app and provide a quick visual cue about the weather conditions.",
		},
		{
		  title: "13. Style the Weather App Using CSS",
		  requirements: "Apply CSS styles to the weather app to improve its visual appeal. Focus on creating a clean, modern design that is also responsive, ensuring that the layout works well on both desktop and mobile devices.",
		},
		{
		  title: "14. Optimize Error Messages and User Feedback",
		  requirements: "Refine the error messages and user feedback mechanisms to make them more informative. Clearly guide the user to correct any issues, such as mistyped city names, and provide helpful hints for getting accurate results.",
		},
		{
		  title: "15. Test Weather Data for Multiple Cities",
		  requirements: "Perform tests by entering a variety of city names to confirm that the weather data is accurately fetched and displayed for each location. Check for both common and less-known cities to validate the app's reliability.",
		},
		{
		  title: "16. Final Code Review and Clean-Up",
		  requirements: "Conduct a thorough code review to identify any potential issues, optimize the code for performance, and remove any unnecessary or redundant lines. Ensure the app is ready for deployment with clean, maintainable code.",
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

	    const repoId: string | undefined = process.env.REPO_ID;
		let tickets: any;
		if (repoId) {
			this._project = projects[repoId];
			tickets = this._project.tickets.map(ticket => ticket.title);
			this._view?.webview.postMessage({ type: 'setTickets', value: tickets });

			this._ticket = this._project.tickets[0]?.title;
			this._ticketRequirements = this._project.tickets[0]?.requirements;
		} else {
			console.error("PROJECT_ID is not defined in the environment variables.");
		}

		

		// add an event listener for messages received by the webview
		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'webviewLoaded':
					{
						this._view?.webview.postMessage({ type: 'setWorkingState', value: this._workingState });
						const requestMessage = {
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
						  
						  
					
						this._view?.webview.postMessage(requestMessage);
						// this.loadAwesomePrompts();
						break;
					}
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
				const activeTabGroup = vscode.window.tabGroups.activeTabGroup;
				const tabs = activeTabGroup.tabs;
	
				if (tabs.length > 0) {
					let mergedContent = '';
					const copiedFiles: string[] = [];
	
					for (const tab of tabs) {
						const uri = (tab.input as vscode.TabInputText).uri;
						if (uri && uri.scheme === 'file') {
							const filename = uri.fsPath;
							const content = await vscode.workspace.fs.readFile(uri);
							mergedContent += `## ${filename}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
							copiedFiles.push(filename);
						}
					}
					searchPrompt = `${task}\n${mergedContent}`;
				} else {
					searchPrompt = task;
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
            const response = await axios.post('http://localhost:5000/api/chat', {
                prompt: searchPrompt,
                conversationId: this._conversation?.conversationId,
                parentMessageId: this._conversation?.parentMessageId,
                apiBaseUrl: this._openaiAPIInfo?.apiBaseUrl,
                model: this._openaiAPIInfo?.model
            }, {
                responseType: 'stream'
            });

            response.data.on('data', (chunk: Buffer) => {
                const partialResponse = JSON.parse(chunk.toString());
                if (partialResponse.id === partialResponse.parentMessageId || this._currentMessageNumber !== currentMessageNumber) {
                    return;
                }

                if (this._view?.visible) {
                    const responseMessage = { type: "addResponse", value: partialResponse };
                    this._view?.webview.postMessage(responseMessage);
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
}

// This method is called when your extension is deactivated
export function deactivate() {}