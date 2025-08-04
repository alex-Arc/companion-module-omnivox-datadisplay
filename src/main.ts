import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	CompanionHTTPRequest,
	CompanionHTTPResponse,
} from '@companion-module/base'
import { GetConfigFields } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { extname, join } from 'path'
import { access, readFile } from 'fs/promises'

export class ModuleInstance extends InstanceBase<object> {
	constructor(internal: unknown) {
		super(internal)
	}

	async init(_config: object): Promise<void> {
		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(_config: object): Promise<void> {}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	public async handleHttpRequest(request: CompanionHTTPRequest): Promise<CompanionHTTPResponse> {
		if (request.method != 'GET') {
			return {
				status: 405, // Method Not Allowed
				body: 'Only GET requests are supported',
			}
		}

		if (request.path === '/') {
			return {
				status: 307, // Temporary Redirect
				headers: { Location: request.baseUrl + '/index.html' },
			}
		}

		const fullPath = join('./static', request.path.toLowerCase())
		this.log('debug', fullPath)

		try {
			await access(fullPath)
			const extension = extname(fullPath)
			const mime = fileMIME[extension]
			if (!mime) {
				return {
					status: 406, // Not Acceptable
					body: `The extension type ${extension} is not supported`,
				}
			}
			const body = (await readFile(fullPath)).toString()
			return { status: 200, body: body, headers: { 'Content-Type': mime } }
		} catch (reason) {
			return {
				status: 404,
				body: (reason as Error).message,
			}
		}
	}
}

const fileMIME: Record<string, string> = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
}

runEntrypoint(ModuleInstance, UpgradeScripts)
