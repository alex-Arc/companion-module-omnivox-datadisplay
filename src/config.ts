import { type SomeCompanionConfigField } from '@companion-module/base'

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 't',
			label: 'V',
			width: 8,
			value: 'Target IP',
		},
	]
}
