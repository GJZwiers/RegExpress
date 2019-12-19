import { RXData, RXPlaceholder, RXSettingsBase } from './IRegex';

export interface RXBasic {
    flags: string
    separator?: string
  }
export interface RXSingle extends RXBasic {
    template: string;
}
export interface RXList extends RXBasic {
    templateList: Array<string>;
}
export type RXSetting = RXSingle | RXList;

export abstract class RegexBuilderBase {
    protected _regexData: RXData;
    protected _settings: RXSetting;
    protected _placeholderData: RXPlaceholder;

    constructor(regexData: RXData, settings: RXSetting, placeholders?: RXPlaceholder) {
        this._regexData = regexData;
        this._settings = settings;  
        this._placeholderData = placeholders || {};
    }

    protected _buildTemplate(template: string) : string {
        for (const namedGroup in this._regexData) {
            const builtGroup = this._buildGroup(this._regexData[namedGroup]);
            const subbedGroup = this._substitutePlaceholder(builtGroup);
            template = template.replace(new RegExp(`${namedGroup}(?=\\W)`, 'g'), subbedGroup);
        }
        
        return template;
    }

    protected _buildGroup(group: string[] | string) : string {
        return (Array.isArray(group)) ? group.join(this._settings.separator || '|') : group;
    }

    protected _substitutePlaceholder(group: string) : string {
        return group.replace(/~~(\w+)~~/, (match: string, p1: string) => {
            if (!this._placeholderData[p1]) throw new Error(`undefined placeholder ${match} in regex data`);
            return this._buildGroup(this._placeholderData[p1]);
        });
    }

}
